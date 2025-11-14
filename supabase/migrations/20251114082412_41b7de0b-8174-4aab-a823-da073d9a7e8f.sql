-- Add foreign key constraint between bids and dealers
-- This ensures every bid references a valid dealer
ALTER TABLE bids 
ADD CONSTRAINT fk_bids_dealer_id 
FOREIGN KEY (dealer_id) 
REFERENCES dealers(id) 
ON DELETE RESTRICT;

-- Add index on dealer_id for better join performance
CREATE INDEX IF NOT EXISTS idx_bids_dealer_id ON bids(dealer_id);

-- Add comment for documentation
COMMENT ON CONSTRAINT fk_bids_dealer_id ON bids IS 
'Ensures every bid references a valid dealer. ON DELETE RESTRICT prevents deletion of dealers with bids.';