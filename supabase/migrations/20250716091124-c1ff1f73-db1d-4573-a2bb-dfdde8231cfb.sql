-- Update the transition_ended_auctions function to also update the status field appropriately
CREATE OR REPLACE FUNCTION public.transition_ended_auctions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Update auction status from 'active' to 'ended' for auctions past their end time
  -- Also update the general status based on whether there are winning bids
  UPDATE public.cars
  SET 
    auction_status = 'ended',
    status = CASE 
      WHEN current_bid IS NOT NULL AND current_bid >= reserve_price THEN 'pending_sale'
      ELSE 'auction_ended'
    END,
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
$function$;

-- Update the admin_end_auction function to set appropriate status
CREATE OR REPLACE FUNCTION public.admin_end_auction(p_car_id uuid, p_admin_id uuid, p_sold boolean DEFAULT true)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_car RECORD;
  v_admin_role TEXT;
BEGIN
  -- Check if user is an admin
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = p_admin_id;
  
  IF v_admin_role != 'admin' THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Only administrators can end auctions'
    );
  END IF;
  
  -- Lock the car row
  SELECT * INTO v_car
  FROM cars
  WHERE id = p_car_id
  FOR UPDATE;
  
  -- Check if car exists
  IF v_car.id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Car not found'
    );
  END IF;
  
  -- Check if auction is active
  IF v_car.auction_status != 'active' THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'This auction is not currently active'
    );
  END IF;
  
  -- Update the car status appropriately
  UPDATE cars
  SET 
    auction_status = CASE WHEN p_sold THEN 'sold' ELSE 'ended' END,
    status = CASE 
      WHEN p_sold THEN 'sold' 
      ELSE 'auction_ended' 
    END,
    updated_at = now()
  WHERE id = p_car_id;
  
  -- Return success
  RETURN json_build_object(
    'success', TRUE,
    'auction_status', CASE WHEN p_sold THEN 'sold' ELSE 'ended' END,
    'status', CASE WHEN p_sold THEN 'sold' ELSE 'auction_ended' END
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', SQLERRM
    );
END;
$function$;

-- Update the process_ended_auctions function to set proper status
CREATE OR REPLACE FUNCTION public.process_ended_auctions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_auction RECORD;
  v_highest_bid RECORD;
  v_second_highest RECORD;
  v_processed_count INTEGER := 0;
  v_won_vehicles_created INTEGER := 0;
BEGIN
  -- Process all ended auctions that need processing
  FOR v_auction IN
    SELECT c.id, c.title, c.current_bid, c.reserve_price, c.auction_status, 
           c.make, c.model, c.year, c.mileage, c.images, c.auction_end_time
    FROM cars c
    WHERE c.auction_status = 'ended'
      AND c.auction_end_time < NOW()
      AND NOT EXISTS (
        SELECT 1 FROM dealer_won_vehicles dwv WHERE dwv.car_id = c.id
      )
  LOOP
    BEGIN
      -- Get the highest bid for this auction
      SELECT b.id, b.dealer_id, b.amount, b.created_at
      INTO v_highest_bid
      FROM bids b
      WHERE b.car_id = v_auction.id
        AND b.status IN ('active', 'outbid')
      ORDER BY b.amount DESC, b.created_at ASC
      LIMIT 1;

      -- Get second highest bid for fee calculation
      SELECT b.amount
      INTO v_second_highest
      FROM bids b
      WHERE b.car_id = v_auction.id
        AND b.dealer_id != COALESCE(v_highest_bid.dealer_id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND b.status IN ('active', 'outbid')
      ORDER BY b.amount DESC
      LIMIT 1;

      IF v_highest_bid.id IS NOT NULL THEN
        -- Check if reserve price was met
        IF v_highest_bid.amount >= v_auction.reserve_price THEN
          -- Reserve price met - create won vehicle record
          
          -- Update bid statuses
          UPDATE bids 
          SET status = 'won', updated_at = NOW()
          WHERE id = v_highest_bid.id;
          
          UPDATE bids 
          SET status = 'lost', updated_at = NOW()
          WHERE car_id = v_auction.id AND id != v_highest_bid.id;

          -- Update car status - sold with pending sale status
          UPDATE cars 
          SET auction_status = 'sold',
              status = 'pending_sale',
              current_bid = v_highest_bid.amount,
              awaiting_seller_decision = true,
              updated_at = NOW()
          WHERE id = v_auction.id;

          -- Create won vehicle record
          INSERT INTO dealer_won_vehicles (
            dealer_id, car_id, winning_bid_amount, original_bid_amount, second_highest_bid,
            platform_fee, auction_end_time, payment_status, seller_details_unlocked,
            vehicle_make, vehicle_model, vehicle_year, vehicle_mileage, vehicle_images
          ) VALUES (
            v_highest_bid.dealer_id, v_auction.id, v_highest_bid.amount, v_highest_bid.amount,
            v_second_highest.amount, 0, COALESCE(v_auction.auction_end_time, NOW()),
            'awaiting_seller_decision', false, COALESCE(v_auction.make, 'Unknown'),
            COALESCE(v_auction.model, 'Unknown'), COALESCE(v_auction.year, 2000),
            v_auction.mileage,
            CASE WHEN v_auction.images IS NOT NULL THEN to_jsonb(v_auction.images) ELSE '[]'::jsonb END
          );

          v_won_vehicles_created := v_won_vehicles_created + 1;

        ELSE
          -- Reserve price not met
          UPDATE bids 
          SET status = 'ended', updated_at = NOW()
          WHERE car_id = v_auction.id;

          -- Update car status - auction ended without sale
          UPDATE cars 
          SET auction_status = 'ended',
              status = 'auction_ended',
              current_bid = v_highest_bid.amount,
              updated_at = NOW()
          WHERE id = v_auction.id;
        END IF;
      ELSE
        -- No bids found
        UPDATE cars 
        SET auction_status = 'ended',
            status = 'auction_ended',
            updated_at = NOW()
        WHERE id = v_auction.id;
      END IF;

      v_processed_count := v_processed_count + 1;

    EXCEPTION WHEN OTHERS THEN
      -- Log the error and continue with next auction
      INSERT INTO system_logs (
        log_type, message, error_message, details
      ) VALUES (
        'auction_processing_error', 'Error processing ended auction', SQLERRM,
        jsonb_build_object('car_id', v_auction.id, 'error_code', SQLSTATE)
      );
    END;
  END LOOP;

  RETURN v_processed_count;
END;
$function$;