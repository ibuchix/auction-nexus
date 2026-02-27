

## Clean Up Auction Outcome Records for Restored Cars

### Problem
18 of the 109 restored cars still have entries in the `dealer_won_vehicles` table from when they briefly ended. This causes them to appear in the Auction Outcomes view as if they need seller decisions. Additionally, 1 car has `awaiting_seller_decision` set to `true`.

### Solution
Run two data cleanup operations (using the insert/update tool, not migrations):

1. **Delete `dealer_won_vehicles` records** for the 109 restored cars (18 records found)
   ```sql
   DELETE FROM dealer_won_vehicles 
   WHERE car_id IN (
     SELECT id FROM cars 
     WHERE auction_status = 'active' 
     AND auction_end_time = '2026-03-07T13:00:00Z'
   );
   ```

2. **Reset `awaiting_seller_decision`** to `false` on the restored cars (1 record found)
   ```sql
   UPDATE cars 
   SET awaiting_seller_decision = false 
   WHERE auction_status = 'active' 
   AND auction_end_time = '2026-03-07T13:00:00Z' 
   AND awaiting_seller_decision = true;
   ```

### Impact
- The 18 cars will no longer appear in the Auction Outcomes page
- No seller decision prompts will show for these active auctions
- All bids and proxy bids remain untouched
- No code changes needed -- this is purely a data cleanup

