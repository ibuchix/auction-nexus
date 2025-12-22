-- Add 11 new columns for vehicle history & specifications
-- All columns are nullable with DEFAULT NULL so existing records are unaffected

-- Origin & Ownership
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_polish_origin boolean DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS owners_count_poland integer DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS import_year integer DEFAULT NULL;

-- Damage & Accident Records
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_damaged_record_poland boolean DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_damaged_record_abroad boolean DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_accident_record_poland boolean DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_accident_record_abroad boolean DEFAULT NULL;

-- Other History Records
ALTER TABLE cars ADD COLUMN IF NOT EXISTS has_mileage_discrepancy boolean DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_recorded_stolen boolean DEFAULT NULL;

-- Technical Inspection & Specifications
ALTER TABLE cars ADD COLUMN IF NOT EXISTS technical_inspection_valid_until date DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS horsepower integer DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN cars.is_polish_origin IS 'True if car originated in Poland, False if imported';
COMMENT ON COLUMN cars.owners_count_poland IS 'Number of previous owners in Poland';
COMMENT ON COLUMN cars.import_year IS 'Year the car was imported (only applicable if not Polish origin)';
COMMENT ON COLUMN cars.is_damaged_record_poland IS 'Has damage been recorded in Poland';
COMMENT ON COLUMN cars.is_damaged_record_abroad IS 'Has damage been recorded abroad';
COMMENT ON COLUMN cars.is_accident_record_poland IS 'Has accident been recorded in Poland';
COMMENT ON COLUMN cars.is_accident_record_abroad IS 'Has accident been recorded abroad';
COMMENT ON COLUMN cars.has_mileage_discrepancy IS 'Has mileage discrepancy been recorded';
COMMENT ON COLUMN cars.is_recorded_stolen IS 'Has the car been recorded as stolen';
COMMENT ON COLUMN cars.technical_inspection_valid_until IS 'Badanie techniczne valid until date';
COMMENT ON COLUMN cars.horsepower IS 'Engine horsepower';