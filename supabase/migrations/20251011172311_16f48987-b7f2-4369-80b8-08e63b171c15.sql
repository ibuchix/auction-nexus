-- Function to create admin notifications
CREATE OR REPLACE FUNCTION public.create_admin_notification(
  p_title text,
  p_message text,
  p_type text,
  p_action_url text DEFAULT NULL,
  p_related_entity_type text DEFAULT NULL,
  p_related_entity_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_notification_id uuid;
BEGIN
  FOR v_admin_id IN 
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      action_url,
      related_entity_type,
      related_entity_id,
      is_read,
      created_at
    ) VALUES (
      v_admin_id,
      p_title,
      p_message,
      p_type,
      p_action_url,
      p_related_entity_type,
      p_related_entity_id,
      false,
      now()
    ) RETURNING id INTO v_notification_id;
  END LOOP;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger Function 1: New Car Listing
CREATE OR REPLACE FUNCTION notify_admin_new_car_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'available')) 
     AND NEW.status = 'available' 
     AND NEW.auction_status IS NULL 
     AND NEW.is_auction = false
  THEN
    PERFORM create_admin_notification(
      'New Car Listing Submitted',
      format('A new %s %s %s has been listed and is ready for auction review.', 
             COALESCE(NEW.year::text, ''), COALESCE(NEW.make, ''), COALESCE(NEW.model, '')),
      'new_listing',
      '/admin/auctions/manage',
      'car',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_car_listing ON cars;
CREATE TRIGGER trigger_notify_new_car_listing
AFTER INSERT OR UPDATE OF status ON cars
FOR EACH ROW
EXECUTE FUNCTION notify_admin_new_car_listing();

-- Trigger Function 2: New Manual Valuation
CREATE OR REPLACE FUNCTION notify_admin_new_manual_valuation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_admin_notification(
      'New Manual Valuation Request',
      format('A new manual valuation request for %s %s %s has been submitted.',
             COALESCE(NEW.year::text, ''), COALESCE(NEW.make, ''), COALESCE(NEW.model, '')),
      'new_manual_valuation',
      '/admin/manual-valuation',
      'manual_valuation',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_new_manual_valuation ON manual_valuations;
CREATE TRIGGER trigger_notify_new_manual_valuation
AFTER INSERT ON manual_valuations
FOR EACH ROW
EXECUTE FUNCTION notify_admin_new_manual_valuation();

-- Trigger Function 3: Seller Accepts Bid
CREATE OR REPLACE FUNCTION notify_admin_seller_accepted_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_car_title text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.decision = 'accepted' THEN
    SELECT CONCAT(COALESCE(year::text, ''), ' ', COALESCE(make, ''), ' ', COALESCE(model, '')) 
    INTO v_car_title
    FROM cars
    WHERE id = NEW.car_id;
    
    PERFORM create_admin_notification(
      'Seller Accepted Bid',
      format('Seller has accepted the winning bid for %s.', COALESCE(v_car_title, 'a vehicle')),
      'bid_accepted',
      '/admin/auction-outcomes',
      'seller_bid_decision',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_seller_accepted_bid ON seller_bid_decisions;
CREATE TRIGGER trigger_notify_seller_accepted_bid
AFTER INSERT ON seller_bid_decisions
FOR EACH ROW
EXECUTE FUNCTION notify_admin_seller_accepted_bid();

-- Trigger Function 4: Dealer Completes Payment
CREATE OR REPLACE FUNCTION notify_admin_dealer_payment_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.payment_status != 'completed' AND NEW.payment_status = 'completed')
     OR (TG_OP = 'INSERT' AND NEW.payment_status = 'completed') THEN
    PERFORM create_admin_notification(
      'Dealer Payment Completed',
      format('Payment completed for %s %s %s - Amount: PLN %s',
             COALESCE(NEW.vehicle_year::text, ''), 
             COALESCE(NEW.vehicle_make, ''), 
             COALESCE(NEW.vehicle_model, ''),
             COALESCE((NEW.winning_bid_amount + NEW.platform_fee)::text, '0')),
      'payment_completed',
      '/admin/auction-outcomes',
      'dealer_won_vehicle',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_dealer_payment_completed ON dealer_won_vehicles;
CREATE TRIGGER trigger_notify_dealer_payment_completed
AFTER INSERT OR UPDATE OF payment_status ON dealer_won_vehicles
FOR EACH ROW
EXECUTE FUNCTION notify_admin_dealer_payment_completed();