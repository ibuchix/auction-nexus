-- Add missing updated_at column to auction_results table
ALTER TABLE public.auction_results 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- Create trigger function to auto-update the timestamp
CREATE OR REPLACE FUNCTION update_auction_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_auction_results_updated_at ON auction_results;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER set_auction_results_updated_at
BEFORE UPDATE ON auction_results
FOR EACH ROW
EXECUTE FUNCTION update_auction_results_updated_at();