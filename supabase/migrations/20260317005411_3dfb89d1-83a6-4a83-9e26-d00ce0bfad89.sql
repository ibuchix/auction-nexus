-- Secure column-level GRANT: only allow users to update safe profile fields
-- This prevents privilege escalation (role, suspended columns remain protected)
GRANT UPDATE (full_name, avatar_url, tracking_ref, updated_at) ON public.profiles TO authenticated;