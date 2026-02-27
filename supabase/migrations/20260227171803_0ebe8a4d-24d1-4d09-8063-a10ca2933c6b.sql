-- Clean up dealer_won_vehicles records for restored active auctions
DELETE FROM dealer_won_vehicles 
WHERE car_id IN (
  SELECT id FROM cars 
  WHERE auction_status = 'active' 
  AND auction_end_time = '2026-03-07T13:00:00+00'
);

-- Reset awaiting_seller_decision flag on restored cars
UPDATE cars 
SET awaiting_seller_decision = false 
WHERE auction_status = 'active' 
AND auction_end_time = '2026-03-07T13:00:00+00' 
AND awaiting_seller_decision = true;