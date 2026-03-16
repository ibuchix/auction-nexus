
-- 1. Add tracking_ref to profiles (stores the ref code that brought this user)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tracking_ref text;

-- 2. Create index for fast lookup by tracking_ref
CREATE INDEX IF NOT EXISTS idx_profiles_tracking_ref ON public.profiles (tracking_ref) WHERE tracking_ref IS NOT NULL;

-- 3. Server-side attribution function: on cars INSERT, auto-create conversion
CREATE OR REPLACE FUNCTION public.attribute_listing_conversion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tracking_ref text;
  v_link_id uuid;
  v_event_id uuid;
BEGIN
  IF NEW.seller_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT tracking_ref INTO v_tracking_ref
  FROM public.profiles
  WHERE id = NEW.seller_id;

  IF v_tracking_ref IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_link_id
  FROM public.tracking_links
  WHERE code = v_tracking_ref AND is_active = true;

  IF v_link_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.tracking_events (
    link_id, event_type, visitor_id, user_id, page_url, metadata
  ) VALUES (
    v_link_id,
    'listing_submitted',
    'server-attributed-' || NEW.seller_id::text,
    NEW.seller_id,
    '/sell',
    jsonb_build_object(
      'car_id', NEW.id,
      'attribution', 'server_side',
      'tracking_ref', v_tracking_ref
    )
  )
  RETURNING id INTO v_event_id;

  INSERT INTO public.tracking_conversions (
    link_id, event_id, conversion_type, user_id
  ) VALUES (
    v_link_id, v_event_id, 'listing_submitted', NEW.seller_id
  );

  RETURN NEW;
END;
$$;

-- 4. Attach trigger to cars table
DROP TRIGGER IF EXISTS trg_attribute_listing_conversion ON public.cars;
CREATE TRIGGER trg_attribute_listing_conversion
  AFTER INSERT ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.attribute_listing_conversion();

-- 5. Registration attribution function (fires when tracking_ref is set on profile)
CREATE OR REPLACE FUNCTION public.attribute_registration_conversion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link_id uuid;
  v_event_id uuid;
BEGIN
  IF OLD.tracking_ref IS NOT NULL OR NEW.tracking_ref IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_link_id
  FROM public.tracking_links
  WHERE code = NEW.tracking_ref AND is_active = true;

  IF v_link_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.tracking_events (
    link_id, event_type, visitor_id, user_id, page_url, metadata
  ) VALUES (
    v_link_id,
    'registration',
    'server-attributed-' || NEW.id::text,
    NEW.id,
    '/auth',
    jsonb_build_object(
      'attribution', 'server_side',
      'tracking_ref', NEW.tracking_ref
    )
  )
  RETURNING id INTO v_event_id;

  INSERT INTO public.tracking_conversions (
    link_id, event_id, conversion_type, user_id
  ) VALUES (
    v_link_id, v_event_id, 'registration', NEW.id
  );

  RETURN NEW;
END;
$$;

-- 6. Attach trigger to profiles table
DROP TRIGGER IF EXISTS trg_attribute_registration_conversion ON public.profiles;
CREATE TRIGGER trg_attribute_registration_conversion
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.attribute_registration_conversion();
