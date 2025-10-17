-- Reset images that were incorrectly marked as deleted due to wrong bucket lookups
-- This fixes images from manual valuations that were transferred to cars table
UPDATE car_file_uploads
SET upload_status = 'completed',
    updated_at = NOW()
WHERE upload_status = 'deleted'
  AND file_path LIKE 'manual-valuations/%';