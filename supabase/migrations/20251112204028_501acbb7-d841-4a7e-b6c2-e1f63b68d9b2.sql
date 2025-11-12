-- Add database indices for optimized search performance
-- These indices will dramatically improve search query performance

-- Full-text search index on cars table for title, make, model, VIN
CREATE INDEX IF NOT EXISTS idx_cars_search_title ON cars USING gin(to_tsvector('english', COALESCE(title, '')));
CREATE INDEX IF NOT EXISTS idx_cars_search_make ON cars USING gin(to_tsvector('english', COALESCE(make, '')));
CREATE INDEX IF NOT EXISTS idx_cars_search_model ON cars USING gin(to_tsvector('english', COALESCE(model, '')));
CREATE INDEX IF NOT EXISTS idx_cars_vin_search ON cars (vin);

-- Improve query performance for auction status filtering
CREATE INDEX IF NOT EXISTS idx_cars_auction_status ON cars (auction_status) WHERE auction_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cars_reserve_price ON cars (reserve_price) WHERE reserve_price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cars_is_auction ON cars (is_auction) WHERE is_auction = true;

-- Optimize auction_schedules queries
CREATE INDEX IF NOT EXISTS idx_auction_schedules_car_id_status ON auction_schedules (car_id, status);
CREATE INDEX IF NOT EXISTS idx_auction_schedules_status ON auction_schedules (status);
CREATE INDEX IF NOT EXISTS idx_auction_schedules_times ON auction_schedules (start_time, end_time);

-- Optimize created_at sorting
CREATE INDEX IF NOT EXISTS idx_cars_created_at_desc ON cars (created_at DESC);

COMMENT ON INDEX idx_cars_search_title IS 'Full-text search index for car titles';
COMMENT ON INDEX idx_cars_search_make IS 'Full-text search index for car makes';
COMMENT ON INDEX idx_cars_search_model IS 'Full-text search index for car models';
COMMENT ON INDEX idx_cars_vin_search IS 'Optimized index for VIN searches';
COMMENT ON INDEX idx_cars_auction_status IS 'Partial index for auction status filtering';
COMMENT ON INDEX idx_cars_reserve_price IS 'Partial index for reserve price queries';
COMMENT ON INDEX idx_auction_schedules_car_id_status IS 'Composite index for schedule lookups';
