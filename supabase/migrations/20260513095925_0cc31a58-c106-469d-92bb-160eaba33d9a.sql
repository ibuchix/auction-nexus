
-- 1) Fix update_auction_status: only update cars whose computed status actually differs.
CREATE OR REPLACE FUNCTION public.update_auction_status()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_updated_cars INTEGER := 0;
  v_updated_schedules INTEGER := 0;
  v_total_updates INTEGER := 0;
BEGIN
  -- Sync cars.auction_status with auction_schedules, but ONLY when the computed
  -- value is actually different from the current one. The previous version had
  -- ELSE branches that returned the same value, which still matched rows in the
  -- WHERE clause and produced redundant UPDATEs (and history rows via trigger).
  WITH computed AS (
    SELECT
      c.id AS car_id,
      c.auction_status AS old_status,
      c.auction_end_time AS old_end_time,
      CASE
        WHEN s.status = 'cancelled' THEN 'cancelled'
        WHEN s.status = 'completed' THEN 'ended'
        WHEN s.status = 'active' AND NOW() >= s.start_time AND NOW() <= s.end_time THEN 'active'
        WHEN s.status = 'scheduled' AND NOW() < s.start_time THEN 'scheduled'
        WHEN s.status = 'active' AND NOW() > s.end_time THEN 'ended'
        ELSE c.auction_status
      END AS new_status,
      s.end_time AS new_end_time
    FROM public.cars c
    JOIN public.auction_schedules s ON s.car_id = c.id
    WHERE c.is_auction = true
  )
  UPDATE public.cars c
  SET
    auction_status = comp.new_status,
    auction_end_time = comp.new_end_time,
    updated_at = NOW()
  FROM computed comp
  WHERE c.id = comp.car_id
    AND (
      comp.old_status IS DISTINCT FROM comp.new_status
      OR comp.old_end_time IS DISTINCT FROM comp.new_end_time
    );

  GET DIAGNOSTICS v_updated_cars = ROW_COUNT;

  -- Auto-progress auction_schedules.status by clock, only when status will change.
  UPDATE public.auction_schedules s
  SET
    status = CASE
      WHEN NOW() < s.start_time THEN 'scheduled'::auction_schedule_status
      WHEN NOW() >= s.start_time AND NOW() <= s.end_time THEN 'active'::auction_schedule_status
      WHEN NOW() > s.end_time THEN 'completed'::auction_schedule_status
      ELSE s.status
    END,
    last_status_change = NOW()
  WHERE s.status IN ('scheduled', 'active')
    AND s.status IS DISTINCT FROM CASE
      WHEN NOW() < s.start_time THEN 'scheduled'::auction_schedule_status
      WHEN NOW() >= s.start_time AND NOW() <= s.end_time THEN 'active'::auction_schedule_status
      WHEN NOW() > s.end_time THEN 'completed'::auction_schedule_status
      ELSE s.status
    END;

  GET DIAGNOSTICS v_updated_schedules = ROW_COUNT;

  -- Cars without a schedule: end them when past auction_end_time.
  UPDATE public.cars
  SET
    auction_status = 'ended',
    updated_at = NOW()
  WHERE is_auction = true
    AND auction_status = 'active'
    AND auction_end_time IS NOT NULL
    AND NOW() > auction_end_time
    AND NOT EXISTS (SELECT 1 FROM public.auction_schedules WHERE car_id = cars.id);

  v_total_updates := v_updated_cars + v_updated_schedules;

  IF v_total_updates > 0 THEN
    INSERT INTO public.system_logs (log_type, message, details)
    VALUES (
      'auction_status_sync',
      'Synchronized auction statuses',
      jsonb_build_object(
        'updated_cars', v_updated_cars,
        'updated_schedules', v_updated_schedules,
        'total_updates', v_total_updates,
        'timestamp', NOW()
      )
    );
  END IF;

  RETURN v_total_updates;
END;
$function$;

-- 2) Defense in depth: never write a cars_history row for a no-op change.
CREATE OR REPLACE FUNCTION public.enforce_car_ownership_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.seller_id IS NOT NULL
     AND NEW.seller_id IS DISTINCT FROM OLD.seller_id
     AND OLD.status != 'draft'
     AND OLD.status IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot change ownership of a published car listing (ID: %)', OLD.id
      USING HINT = 'Car listings that are no longer drafts must maintain their original ownership.';
  END IF;

  -- Only record history on real, value-level changes.
  IF (OLD.status IS DISTINCT FROM NEW.status)
     OR (OLD.seller_id IS DISTINCT FROM NEW.seller_id)
     OR (OLD.auction_status IS DISTINCT FROM NEW.auction_status) THEN

    INSERT INTO public.cars_history(
      car_id, seller_id, status, previous_status, changed_by, change_type, metadata
    ) VALUES (
      NEW.id, NEW.seller_id, NEW.status, OLD.status, auth.uid(),
      CASE
        WHEN OLD.status = 'draft' AND NEW.status != 'draft' THEN 'published'
        WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_changed'
        WHEN OLD.auction_status IS DISTINCT FROM NEW.auction_status THEN 'auction_status_changed'
        WHEN OLD.seller_id IS DISTINCT FROM NEW.seller_id THEN 'ownership_changed'
        ELSE 'updated'
      END,
      jsonb_build_object(
        'old_seller_id', OLD.seller_id,
        'new_seller_id', NEW.seller_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'old_auction_status', OLD.auction_status,
        'new_auction_status', NEW.auction_status
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Daily cleanup: 90-day retention, no batch cap, 4-minute wall-clock budget.
CREATE OR REPLACE FUNCTION public.cleanup_cars_history_daily()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  deleted_count BIGINT := 0;
  batch_deleted INTEGER;
  batch_size INTEGER := 5000;
  batch_num INTEGER := 0;
  start_time TIMESTAMP := clock_timestamp();
  max_seconds INTEGER := 240; -- 4 minute budget per nightly run
BEGIN
  cutoff_date := NOW() - INTERVAL '90 days';

  LOOP
    batch_num := batch_num + 1;

    DELETE FROM public.cars_history
    WHERE id IN (
      SELECT id FROM public.cars_history
      WHERE changed_at < cutoff_date
      LIMIT batch_size
    );

    GET DIAGNOSTICS batch_deleted = ROW_COUNT;
    deleted_count := deleted_count + batch_deleted;

    EXIT WHEN batch_deleted = 0;
    EXIT WHEN EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) > max_seconds;

    PERFORM pg_sleep(0.05);
  END LOOP;

  INSERT INTO public.system_logs (log_type, message, details)
  VALUES (
    'cleanup',
    'Daily cars_history cleanup completed',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'cutoff_date', cutoff_date,
      'batches', batch_num,
      'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time))
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'batches', batch_num,
    'cutoff_date', cutoff_date,
    'duration_seconds', EXTRACT(EPOCH FROM (clock_timestamp() - start_time))
  );
END;
$function$;
