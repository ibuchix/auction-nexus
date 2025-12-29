-- Drop unused indexes to save ~188MB of storage
DROP INDEX IF EXISTS idx_system_logs_correlation_id;
DROP INDEX IF EXISTS idx_cars_features_gin;
DROP INDEX IF EXISTS idx_car_file_uploads_car_id_category;
DROP INDEX IF EXISTS idx_cars_search_title;
DROP INDEX IF EXISTS idx_car_file_uploads_session_id;
DROP INDEX IF EXISTS idx_cars_search_model;
DROP INDEX IF EXISTS idx_cars_search_make;
DROP INDEX IF EXISTS idx_manual_file_uploads_session_id