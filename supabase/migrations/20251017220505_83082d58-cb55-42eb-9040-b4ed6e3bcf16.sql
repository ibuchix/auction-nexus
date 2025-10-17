-- Fix 1: Reset Mitsubishi images back to completed status
UPDATE car_file_uploads
SET upload_status = 'completed',
    updated_at = NOW()
WHERE car_id = 'e06d6f39-681a-463e-855a-64010ca17b28'
  AND file_path LIKE 'manual-valuations/%'
  AND upload_status = 'deleted';

-- Log the repair for audit trail
INSERT INTO system_logs (log_type, message, details)
VALUES (
  'image_status_repair',
  'Reset incorrectly deleted Mitsubishi images',
  jsonb_build_object(
    'car_id', 'e06d6f39-681a-463e-855a-64010ca17b28',
    'reason', 'Images marked deleted due to overly aggressive auto-deletion logic',
    'fix', 'Removed auto-deletion logic from fetchCarImagesFromDatabase function'
  )
);

-- Fix 2: Add defensive logging trigger to track future image status changes
CREATE OR REPLACE FUNCTION log_car_image_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log when status changes from completed to deleted
  IF OLD.upload_status = 'completed' AND NEW.upload_status = 'deleted' THEN
    INSERT INTO system_logs (
      log_type, 
      message, 
      details
    ) VALUES (
      'image_status_change',
      'Car image marked as deleted',
      jsonb_build_object(
        'upload_id', NEW.id,
        'car_id', NEW.car_id,
        'file_path', NEW.file_path,
        'previous_status', OLD.upload_status,
        'new_status', NEW.upload_status,
        'bucket', CASE 
          WHEN NEW.file_path LIKE 'manual-valuations/%' THEN 'manual-valuation-photos'
          ELSE 'car-images'
        END,
        'timestamp', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS track_car_image_deletion ON car_file_uploads;

-- Create trigger on car_file_uploads table
CREATE TRIGGER track_car_image_deletion
  BEFORE UPDATE ON car_file_uploads
  FOR EACH ROW
  WHEN (OLD.upload_status IS DISTINCT FROM NEW.upload_status)
  EXECUTE FUNCTION log_car_image_status_change();