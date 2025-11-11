-- Drop legacy JWT-based service role policy that causes conflicts
DROP POLICY IF EXISTS "Service role bypass RLS" ON car_file_uploads;

-- Recreate admin policy to apply to PUBLIC role (includes both authenticated and anon)
-- This ensures the policy is always evaluated regardless of session state
DROP POLICY IF EXISTS "Admins can manage all photos" ON car_file_uploads;

CREATE POLICY "Admins can manage all photos"
ON car_file_uploads
FOR ALL
TO public  -- Changed from 'authenticated' to 'public' for consistent evaluation
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Add comment explaining the design
COMMENT ON POLICY "Admins can manage all photos" ON car_file_uploads IS 
'Allows users with admin role in user_roles table to manage all car photos. Applies to public role to ensure consistent evaluation regardless of session state.';