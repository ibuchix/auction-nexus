-- Drop existing function first
DROP FUNCTION IF EXISTS public.process_ended_auctions();

-- Create function to automatically transition ended auctions
CREATE OR REPLACE FUNCTION public.transition_ended_auctions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Update auction status from 'active' to 'ended' for auctions past their end time
  UPDATE public.cars
  SET auction_status = 'ended',
      updated_at = NOW()
  WHERE auction_status = 'active'
    AND auction_end_time < NOW()
    AND auction_end_time IS NOT NULL;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Log the operation if audit_logs table exists
  BEGIN
    INSERT INTO public.audit_logs (
      action,
      entity_type,
      details
    ) VALUES (
      'auction_status_transition',
      'auction',
      jsonb_build_object(
        'updated_count', v_updated_count,
        'timestamp', NOW()
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if audit_logs table doesn't exist or has issues
    NULL;
  END;
  
  RETURN v_updated_count;
END;
$$;

-- Create function to process auction completion and populate results tables
CREATE OR REPLACE FUNCTION public.process_ended_auctions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_processed_count INTEGER := 0;
  v_auction RECORD;
  v_highest_bid RECORD;
  v_bid_metrics RECORD;
BEGIN
  -- Process each ended auction that hasn't been processed yet
  FOR v_auction IN
    SELECT c.*
    FROM public.cars c
    WHERE c.auction_status = 'ended'
      AND c.auction_end_time < NOW()
      AND NOT EXISTS (
        SELECT 1 FROM public.auction_results ar WHERE ar.car_id = c.id
      )
  LOOP
    -- Get highest bid and metrics for this auction
    SELECT 
      b.dealer_id,
      b.amount as final_price,
      COUNT(DISTINCT b.dealer_id) as unique_bidders,
      COUNT(b.id) as total_bids
    INTO v_highest_bid
    FROM public.bids b
    WHERE b.car_id = v_auction.id
      AND b.status = 'active'
    GROUP BY b.dealer_id, b.amount
    ORDER BY b.amount DESC
    LIMIT 1;
    
    -- Get bid count metrics
    SELECT 
      COUNT(DISTINCT dealer_id) as unique_bidders,
      COUNT(id) as total_bids
    INTO v_bid_metrics
    FROM public.bids
    WHERE car_id = v_auction.id;
    
    -- Insert into auction_results
    INSERT INTO public.auction_results (
      car_id,
      auction_id,
      final_price,
      highest_bid_dealer_id,
      unique_bidders,
      total_bids,
      bid_count,
      sale_status,
      admin_review_status
    ) VALUES (
      v_auction.id,
      v_auction.id,
      COALESCE(v_highest_bid.final_price, 0),
      v_highest_bid.dealer_id,
      COALESCE(v_bid_metrics.unique_bidders, 0),
      COALESCE(v_bid_metrics.total_bids, 0),
      COALESCE(v_bid_metrics.total_bids, 0),
      CASE 
        WHEN v_highest_bid.final_price >= v_auction.reserve_price THEN 'sold'
        ELSE 'unsold'
      END,
      'pending'
    );
    
    -- Insert into auction_closure_details
    INSERT INTO public.auction_closure_details (
      car_id,
      title,
      make,
      model,
      year,
      auction_end_time,
      final_price,
      total_bids,
      unique_bidders,
      sale_status
    ) VALUES (
      v_auction.id,
      v_auction.title,
      v_auction.make,
      v_auction.model,
      v_auction.year,
      v_auction.auction_end_time,
      COALESCE(v_highest_bid.final_price, 0),
      COALESCE(v_bid_metrics.total_bids, 0),
      COALESCE(v_bid_metrics.unique_bidders, 0),
      CASE 
        WHEN v_highest_bid.final_price >= v_auction.reserve_price THEN 'sold'
        ELSE 'unsold'
      END
    );
    
    v_processed_count := v_processed_count + 1;
  END LOOP;
  
  RETURN v_processed_count;
END;
$$;