-- Grant table-level permissions for tracking tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_links TO authenticated;
GRANT SELECT ON public.tracking_events TO authenticated;
GRANT INSERT ON public.tracking_events TO anon;
GRANT SELECT ON public.tracking_conversions TO authenticated;