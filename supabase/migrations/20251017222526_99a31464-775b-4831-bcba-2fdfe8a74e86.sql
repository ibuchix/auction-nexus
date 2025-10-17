-- Reset BMW X3 images back to completed status
UPDATE car_file_uploads
SET upload_status = 'completed',
    updated_at = NOW()
WHERE car_id = '5396bf16-049a-417a-958b-3c5edffc9100'
  AND file_path LIKE 'manual-valuations/%'
  AND upload_status = 'deleted';

-- Log the repair for audit trail
INSERT INTO system_logs (log_type, message, details)
VALUES (
  'image_status_repair',
  'Reset incorrectly deleted BMW X3 images',
  jsonb_build_object(
    'car_id', '5396bf16-049a-417a-958b-3c5edffc9100',
    'make', 'BMW',
    'model', 'X3',
    'year', 2024,
    'reason', 'Images marked deleted before auto-deletion fix was implemented'
  )
);