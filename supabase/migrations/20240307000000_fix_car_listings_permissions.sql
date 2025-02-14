
-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view car listings" ON car_listings;

-- Grant usage on the schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant select permission on car_listings to authenticated users
GRANT SELECT ON car_listings TO authenticated;

-- Create a policy to allow viewing car_listings
CREATE POLICY "Anyone can view car listings"
ON car_listings
FOR SELECT
TO authenticated
USING (true);

-- Refresh the materialized view to ensure it's up to date
REFRESH MATERIALIZED VIEW car_listings;
