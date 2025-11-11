-- Clean up duplicate admin RLS policy on car_file_uploads
-- We're using the JWT-based policy created in the previous migration

DROP POLICY IF EXISTS "Admins can manage all photos" ON public.car_file_uploads;