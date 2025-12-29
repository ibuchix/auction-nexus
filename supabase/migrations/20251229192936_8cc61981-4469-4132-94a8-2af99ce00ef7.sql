-- Monthly Vehicle Cleanup Function (cleans cars and manual_valuations older than 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_vehicle_data(dry_run boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff_date timestamp with time zone := NOW() - INTERVAL '6 months';
  deleted_cars bigint := 0;
  deleted_bids bigint := 0;
  deleted_auction_schedules bigint := 0;
  deleted_dealer_won_vehicles bigint := 0;
  deleted_auction_results bigint := 0;
  deleted_dealer_wishlists bigint := 0;
  deleted_car_file_uploads bigint := 0;
  deleted_cars_history_orphaned bigint := 0;
  deleted_manual_valuations bigint := 0;
  deleted_manual_file_uploads bigint := 0;
  deleted_auction_metrics bigint := 0;
  deleted_auction_closure_details bigint := 0;
  deleted_listing_verifications bigint := 0;
  car_file_paths text[] := ARRAY[]::text[];
  manual_file_paths text[] := ARRAY[]::text[];
  temp_paths text[];
  old_car_ids uuid[];
  old_valuation_ids uuid[];
BEGIN
  -- Identify old cars (exclude active auctions and pending payments)
  SELECT ARRAY_AGG(c.id) INTO old_car_ids
  FROM cars c
  WHERE c.created_at < cutoff_date
    AND COALESCE(c.auction_status, '') NOT IN ('active', 'scheduled')
    AND NOT EXISTS (
      SELECT 1 FROM dealer_won_vehicles dwv 
      WHERE dwv.car_id = c.id AND dwv.payment_status IN ('pending', 'processing')
    );

  -- Identify old manual valuations
  SELECT ARRAY_AGG(mv.id) INTO old_valuation_ids
  FROM manual_valuations mv WHERE mv.created_at < cutoff_date;

  IF old_car_ids IS NULL THEN old_car_ids := ARRAY[]::uuid[]; END IF;
  IF old_valuation_ids IS NULL THEN old_valuation_ids := ARRAY[]::uuid[]; END IF;

  -- Collect file paths before deletion
  SELECT ARRAY_AGG(file_path) INTO temp_paths FROM car_file_uploads WHERE car_id = ANY(old_car_ids);
  IF temp_paths IS NOT NULL THEN car_file_paths := car_file_paths || temp_paths; END IF;

  SELECT ARRAY_AGG(file_path) INTO temp_paths FROM manual_file_uploads WHERE manual_valuation_id = ANY(old_valuation_ids);
  IF temp_paths IS NOT NULL THEN manual_file_paths := manual_file_paths || temp_paths; END IF;

  -- Delete car-related records (if not dry run)
  IF NOT dry_run AND array_length(old_car_ids, 1) > 0 THEN
    DELETE FROM bids WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_bids = ROW_COUNT;

    DELETE FROM auction_schedules WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_auction_schedules = ROW_COUNT;

    DELETE FROM dealer_won_vehicles WHERE car_id = ANY(old_car_ids) AND payment_status NOT IN ('pending', 'processing');
    GET DIAGNOSTICS deleted_dealer_won_vehicles = ROW_COUNT;

    DELETE FROM auction_results WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_auction_results = ROW_COUNT;

    DELETE FROM dealer_wishlists WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_dealer_wishlists = ROW_COUNT;

    DELETE FROM car_file_uploads WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_car_file_uploads = ROW_COUNT;

    DELETE FROM cars_history WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_cars_history_orphaned = ROW_COUNT;

    DELETE FROM auction_metrics WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_auction_metrics = ROW_COUNT;

    DELETE FROM auction_closure_details WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_auction_closure_details = ROW_COUNT;

    DELETE FROM listing_verifications WHERE car_id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_listing_verifications = ROW_COUNT;

    DELETE FROM cars WHERE id = ANY(old_car_ids);
    GET DIAGNOSTICS deleted_cars = ROW_COUNT;
  END IF;

  -- Delete manual valuations
  IF NOT dry_run AND array_length(old_valuation_ids, 1) > 0 THEN
    DELETE FROM manual_file_uploads WHERE manual_valuation_id = ANY(old_valuation_ids);
    GET DIAGNOSTICS deleted_manual_file_uploads = ROW_COUNT;

    DELETE FROM manual_valuations WHERE id = ANY(old_valuation_ids);
    GET DIAGNOSTICS deleted_manual_valuations = ROW_COUNT;
  END IF;

  -- Log cleanup
  IF NOT dry_run THEN
    INSERT INTO audit_logs (action, entity_type, details)
    VALUES ('vehicle_data_cleanup', 'system', jsonb_build_object(
      'deleted', jsonb_build_object('cars', deleted_cars, 'bids', deleted_bids, 'manual_valuations', deleted_manual_valuations),
      'file_counts', jsonb_build_object('car_files', COALESCE(array_length(car_file_paths, 1), 0), 'manual_files', COALESCE(array_length(manual_file_paths, 1), 0)),
      'cutoff_date', cutoff_date, 'executed_at', NOW()
    ));
  END IF;

  RETURN jsonb_build_object(
    'success', true, 'dry_run', dry_run, 'cutoff_date', cutoff_date,
    'deleted', jsonb_build_object(
      'cars', CASE WHEN dry_run THEN COALESCE(array_length(old_car_ids, 1), 0) ELSE deleted_cars END,
      'bids', deleted_bids, 'auction_schedules', deleted_auction_schedules,
      'dealer_won_vehicles', deleted_dealer_won_vehicles, 'auction_results', deleted_auction_results,
      'dealer_wishlists', deleted_dealer_wishlists, 'car_file_uploads', deleted_car_file_uploads,
      'cars_history', deleted_cars_history_orphaned, 'auction_metrics', deleted_auction_metrics,
      'listing_verifications', deleted_listing_verifications,
      'manual_valuations', CASE WHEN dry_run THEN COALESCE(array_length(old_valuation_ids, 1), 0) ELSE deleted_manual_valuations END,
      'manual_file_uploads', deleted_manual_file_uploads
    ),
    'file_paths_to_delete', jsonb_build_object('car_files', car_file_paths, 'manual_files', manual_file_paths),
    'executed_at', NOW()
  );
END;
$$