
-- Fix the trigger that updates car auction times from schedule
-- The cars table doesn't have auction_start_time column, only auction_end_time

CREATE OR REPLACE FUNCTION public.update_car_auction_times_from_schedule()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only update the columns that actually exist in the cars table
  UPDATE public.cars
  SET 
    auction_end_time = NEW.end_time,
    updated_at = now(),
    is_manually_controlled = NEW.is_manually_controlled
  WHERE id = NEW.car_id;
  
  RETURN NEW;
END;
$function$;
