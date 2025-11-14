-- Add 'extend_auction' to audit_log_type enum
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'extend_auction' 
    AND enumtypid = 'audit_log_type'::regtype
  ) THEN
    ALTER TYPE audit_log_type ADD VALUE 'extend_auction';
  END IF;
END $$;