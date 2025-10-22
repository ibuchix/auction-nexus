-- Add unique constraint on car_id to auction_results table to support ON CONFLICT
-- This is needed by process_ended_auctions_securely() function

ALTER TABLE public.auction_results 
ADD CONSTRAINT auction_results_car_id_key UNIQUE (car_id);