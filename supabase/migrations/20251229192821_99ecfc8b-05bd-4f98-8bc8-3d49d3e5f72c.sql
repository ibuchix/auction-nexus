-- Enhanced Weekly Cleanup Function with additional tables
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_system_logs bigint := 0;
  deleted_cars_history bigint := 0;
  deleted_audit_logs bigint := 0;
  deleted_vin_cache bigint := 0;
  deleted_password_tokens bigint := 0;
  deleted_vin_reservations bigint := 0;
  deleted_notifications bigint := 0;
  deleted_photo_audit_logs bigint := 0;
  deleted_photo_rate_limits bigint := 0;
  deleted_dealer_rate_limits bigint := 0;
  batch_size int := 50000;
  rows_affected int;
  total_deleted bigint := 0;
BEGIN
  LOOP
    DELETE FROM system_logs WHERE id IN (
      SELECT id FROM system_logs WHERE created_at < NOW() - INTERVAL '90 days' LIMIT batch_size
    );
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    deleted_system_logs := deleted_system_logs + rows_affected;
    EXIT WHEN rows_affected < batch_size;
    PERFORM pg_sleep(0.1);
  END LOOP;

  LOOP
    DELETE FROM cars_history WHERE id IN (
      SELECT id FROM cars_history WHERE changed_at < NOW() - INTERVAL '90 days' LIMIT batch_size
    );
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    deleted_cars_history := deleted_cars_history + rows_affected;
    EXIT WHEN rows_affected < batch_size;
    PERFORM pg_sleep(0.1);
  END LOOP;

  LOOP
    DELETE FROM audit_logs WHERE id IN (
      SELECT id FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days' LIMIT batch_size
    );
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    deleted_audit_logs := deleted_audit_logs + rows_affected;
    EXIT WHEN rows_affected < batch_size;
    PERFORM pg_sleep(0.1);
  END LOOP;

  DELETE FROM vin_valuation_cache WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_vin_cache = ROW_COUNT;

  DELETE FROM password_reset_tokens WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_password_tokens = ROW_COUNT;

  DELETE FROM vin_reservations WHERE status = 'expired' OR expires_at < NOW();
  GET DIAGNOSTICS deleted_vin_reservations = ROW_COUNT;

  DELETE FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_notifications = ROW_COUNT;

  DELETE FROM photo_upload_audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_photo_audit_logs = ROW_COUNT;

  DELETE FROM photo_upload_rate_limits WHERE date < CURRENT_DATE - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_photo_rate_limits = ROW_COUNT;

  DELETE FROM dealer_bid_rate_limits WHERE bid_date < CURRENT_DATE - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_dealer_rate_limits = ROW_COUNT;

  total_deleted := deleted_system_logs + deleted_cars_history + deleted_audit_logs + 
                   deleted_vin_cache + deleted_password_tokens + deleted_vin_reservations +
                   deleted_notifications + deleted_photo_audit_logs + deleted_photo_rate_limits +
                   deleted_dealer_rate_limits;

  INSERT INTO audit_logs (action, entity_type, details)
  VALUES ('system_cleanup', 'system', jsonb_build_object(
    'deleted', jsonb_build_object(
      'system_logs', deleted_system_logs, 'cars_history', deleted_cars_history,
      'audit_logs', deleted_audit_logs, 'vin_valuation_cache', deleted_vin_cache,
      'password_reset_tokens', deleted_password_tokens, 'vin_reservations', deleted_vin_reservations,
      'notifications', deleted_notifications, 'photo_upload_audit_logs', deleted_photo_audit_logs,
      'photo_upload_rate_limits', deleted_photo_rate_limits, 'dealer_bid_rate_limits', deleted_dealer_rate_limits,
      'total', total_deleted
    ), 'executed_at', NOW()
  ));

  RETURN jsonb_build_object('success', true, 'deleted', jsonb_build_object(
    'system_logs', deleted_system_logs, 'cars_history', deleted_cars_history,
    'audit_logs', deleted_audit_logs, 'vin_valuation_cache', deleted_vin_cache,
    'password_reset_tokens', deleted_password_tokens, 'vin_reservations', deleted_vin_reservations,
    'notifications', deleted_notifications, 'photo_upload_audit_logs', deleted_photo_audit_logs,
    'photo_upload_rate_limits', deleted_photo_rate_limits, 'dealer_bid_rate_limits', deleted_dealer_rate_limits,
    'total', total_deleted
  ), 'executed_at', NOW());
END;
$$