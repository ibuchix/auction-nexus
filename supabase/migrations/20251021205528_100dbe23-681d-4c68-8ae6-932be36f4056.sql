-- Fix race condition in auction processing by adding ON CONFLICT handling
-- and better error handling to prevent one failure from blocking others

CREATE OR REPLACE FUNCTION public.process_ended_auctions_securely()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  now_timestamp timestamptz := NOW();
  ended_auctions_count integer := 0;
  processed_auctions_count integer := 0;
  failed_auctions_count integer := 0;
  
  auction_record record;
  winning_bid_id uuid;
  winning_dealer_id uuid;
  winning_amount numeric;
  original_amount numeric;
  second_highest_amount numeric;
  
  bids_above_reserve_count integer := 0;
  
  platform_fee_amount numeric;
  vehicle_data record;
  result_json jsonb;
BEGIN
  RAISE LOG '🚀 Starting process_ended_auctions_securely at %', now_timestamp;
  
  -- Count auctions that have ended but not yet processed
  SELECT COUNT(*) INTO ended_auctions_count
  FROM cars c
  INNER JOIN auction_schedules asch ON c.id = asch.car_id
  WHERE asch.end_time <= now_timestamp
    AND (
      (asch.status = 'active' AND c.auction_status = 'active')
      OR
      (asch.status = 'completed' AND c.auction_status = 'ended')
    )
    AND c.id NOT IN (SELECT dwv.car_id FROM dealer_won_vehicles dwv);
  
  RAISE LOG '📊 Found % ended auctions to process', ended_auctions_count;
  
  -- Process each ended auction that hasn't been processed yet
  FOR auction_record IN
    SELECT 
      c.id,
      c.make,
      c.model,
      c.year,
      c.title,
      c.reserve_price,
      asch.end_time,
      asch.id as schedule_id
    FROM cars c
    INNER JOIN auction_schedules asch ON c.id = asch.car_id
    WHERE asch.end_time <= now_timestamp
      AND (
        (asch.status = 'active' AND c.auction_status = 'active')
        OR
        (asch.status = 'completed' AND c.auction_status = 'ended')
      )
      AND c.id NOT IN (SELECT dwv.car_id FROM dealer_won_vehicles dwv)
    ORDER BY asch.end_time ASC
  LOOP
    BEGIN
      RAISE LOG '🏁 Processing auction: % - % % % (Reserve: % PLN)',
        auction_record.id,
        auction_record.year,
        auction_record.make,
        auction_record.model,
        auction_record.reserve_price;
      
      -- Count bids above reserve
      SELECT COUNT(*) INTO bids_above_reserve_count
      FROM bids b
      WHERE b.car_id = auction_record.id
        AND b.amount >= auction_record.reserve_price
        AND b.status = 'active';
      
      RAISE LOG '📈 Found % bids at or above reserve (% PLN)',
        bids_above_reserve_count, auction_record.reserve_price;
      
      -- CASE 1: No bids above reserve
      IF bids_above_reserve_count = 0 THEN
        SELECT b.id, b.dealer_id, b.amount
        INTO winning_bid_id, winning_dealer_id, original_amount
        FROM bids b
        WHERE b.car_id = auction_record.id AND b.status = 'active'
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1;
        
        IF NOT FOUND THEN
          RAISE LOG '❌ No bids found for auction %. Marking as ended.', auction_record.id;
          UPDATE cars 
          SET auction_status = 'ended', status = 'ended', updated_at = NOW()
          WHERE id = auction_record.id;
          UPDATE auction_schedules
          SET status = 'completed', last_status_change = NOW(), updated_at = NOW()
          WHERE id = auction_record.schedule_id;
          CONTINUE;
        END IF;
        
        winning_amount := original_amount;
        RAISE LOG '✅ CASE 1: Winner pays exact bid of % PLN', winning_amount;
      
      -- CASE 2: Exactly one bid above reserve
      ELSIF bids_above_reserve_count = 1 THEN
        SELECT b.id, b.dealer_id, b.amount
        INTO winning_bid_id, winning_dealer_id, original_amount
        FROM bids b
        WHERE b.car_id = auction_record.id
          AND b.amount >= auction_record.reserve_price
          AND b.status = 'active'
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1;
        
        winning_amount := auction_record.reserve_price;
        RAISE LOG '✅ CASE 2: Winner pays reserve price of % PLN (bid: % PLN)',
          winning_amount, original_amount;
      
      -- CASE 3: Two or more bids above reserve
      ELSE
        SELECT b.id, b.dealer_id, b.amount
        INTO winning_bid_id, winning_dealer_id, original_amount
        FROM bids b
        WHERE b.car_id = auction_record.id
          AND b.amount >= auction_record.reserve_price
          AND b.status = 'active'
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1;
        
        SELECT b.amount INTO second_highest_amount
        FROM bids b
        WHERE b.car_id = auction_record.id
          AND b.amount >= auction_record.reserve_price
          AND b.amount < original_amount
          AND b.status = 'active'
        ORDER BY b.amount DESC, b.created_at ASC
        LIMIT 1;
        
        IF (original_amount - second_highest_amount) > 250 THEN
          winning_amount := second_highest_amount + 250;
          RAISE LOG '✅ CASE 3a: Winner pays % PLN (2nd: % + 250)', winning_amount, second_highest_amount;
        ELSE
          winning_amount := original_amount;
          RAISE LOG '✅ CASE 3b: Winner pays exact bid % PLN (gap ≤ 250)', winning_amount;
        END IF;
      END IF;
      
      -- Calculate platform fee
      CASE 
        WHEN winning_amount < 5000 THEN platform_fee_amount := 600;
        WHEN winning_amount < 10000 THEN platform_fee_amount := 700;
        WHEN winning_amount < 20000 THEN platform_fee_amount := 800;
        WHEN winning_amount < 30000 THEN platform_fee_amount := 900;
        WHEN winning_amount < 40000 THEN platform_fee_amount := 1000;
        WHEN winning_amount < 50000 THEN platform_fee_amount := 1100;
        WHEN winning_amount < 60000 THEN platform_fee_amount := 1200;
        WHEN winning_amount < 70000 THEN platform_fee_amount := 1300;
        WHEN winning_amount < 80000 THEN platform_fee_amount := 1400;
        WHEN winning_amount < 90000 THEN platform_fee_amount := 1500;
        WHEN winning_amount < 100000 THEN platform_fee_amount := 1600;
        WHEN winning_amount < 125000 THEN platform_fee_amount := 1700;
        WHEN winning_amount < 150000 THEN platform_fee_amount := 1800;
        WHEN winning_amount < 175000 THEN platform_fee_amount := 1900;
        WHEN winning_amount < 200000 THEN platform_fee_amount := 2050;
        WHEN winning_amount < 225000 THEN platform_fee_amount := 2150;
        WHEN winning_amount < 250000 THEN platform_fee_amount := 2250;
        WHEN winning_amount < 300000 THEN platform_fee_amount := 2550;
        WHEN winning_amount < 350000 THEN platform_fee_amount := 2650;
        WHEN winning_amount < 400000 THEN platform_fee_amount := 2750;
        WHEN winning_amount < 500000 THEN platform_fee_amount := 2850;
        ELSE platform_fee_amount := 3150;
      END CASE;
      
      RAISE LOG '💰 Platform fee: % PLN for winning amount % PLN', platform_fee_amount, winning_amount;
      
      -- Get second highest bid overall for record keeping
      SELECT b.amount INTO second_highest_amount
      FROM bids b
      WHERE b.car_id = auction_record.id
        AND b.amount < original_amount
        AND b.status = 'active'
      ORDER BY b.amount DESC, b.created_at ASC
      LIMIT 1;
      
      -- Get vehicle details
      SELECT c.make, c.model, c.year, c.mileage, c.images
      INTO vehicle_data
      FROM cars c
      WHERE c.id = auction_record.id;
      
      -- Update cars table
      UPDATE cars
      SET auction_status = 'ended', status = 'sold', current_bid = winning_amount, updated_at = NOW()
      WHERE id = auction_record.id;
      
      -- Update auction schedule
      UPDATE auction_schedules
      SET status = 'completed', last_status_change = NOW(), updated_at = NOW()
      WHERE id = auction_record.schedule_id;
      
      -- FIXED: Add ON CONFLICT to handle race conditions
      INSERT INTO dealer_won_vehicles (
        dealer_id, car_id, winning_bid_amount, original_bid_amount,
        second_highest_bid, platform_fee, auction_end_time, payment_status,
        vehicle_make, vehicle_model, vehicle_year, vehicle_mileage,
        vehicle_images, created_at, updated_at
      ) VALUES (
        winning_dealer_id, auction_record.id, winning_amount, original_amount,
        second_highest_amount, platform_fee_amount, auction_record.end_time,
        'pending', vehicle_data.make, vehicle_data.model, vehicle_data.year,
        vehicle_data.mileage, to_jsonb(vehicle_data.images), NOW(), NOW()
      )
      ON CONFLICT (car_id) DO NOTHING;
      
      RAISE LOG '✅ Processed: Winner Dealer %, Amount: % PLN, Fee: % PLN, Total: % PLN',
        winning_dealer_id, winning_amount, platform_fee_amount, (winning_amount + platform_fee_amount);
      
      processed_auctions_count := processed_auctions_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log the error but continue processing other auctions
      RAISE LOG '❌ Failed to process auction %: % (Code: %)', 
        auction_record.id, SQLERRM, SQLSTATE;
      failed_auctions_count := failed_auctions_count + 1;
    END;
  END LOOP;
  
  RAISE LOG '🎉 Completed: % ended, % processed, % failed', 
    ended_auctions_count, processed_auctions_count, failed_auctions_count;
  
  RETURN jsonb_build_object(
    'success', true,
    'timestamp', now_timestamp,
    'ended_auctions', ended_auctions_count,
    'processed_auctions', processed_auctions_count,
    'failed_auctions', failed_auctions_count
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG '❌ FATAL ERROR: % (Code: %)', SQLERRM, SQLSTATE;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE,
    'timestamp', NOW()
  );
END;
$function$;

-- Now manually process the stuck auctions from 20:30
SELECT process_ended_auctions_securely();