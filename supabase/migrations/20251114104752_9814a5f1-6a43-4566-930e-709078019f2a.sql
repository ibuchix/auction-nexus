-- Phase 1: Fix Database Table Permissions
-- Grant table access to authenticated users for basic operations
GRANT SELECT, INSERT ON dealer_documents TO authenticated;

-- Grant all operations to service role (for admin operations and edge functions)
GRANT ALL ON dealer_documents TO service_role;

-- Add helpful comment
COMMENT ON TABLE dealer_documents IS 'Dealer verification documents. Access controlled by RLS policies. Dealers can upload/view, admins can manage all.';

-- Phase 2: Fix Storage Bucket Policies
-- Drop all existing conflicting policies on storage.objects for dealer-documents
DROP POLICY IF EXISTS "Admins can manage all dealer documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all dealer documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view dealer documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can download dealer documents" ON storage.objects;
DROP POLICY IF EXISTS "Dealers can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Dealers can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Dealers can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Dealers can view their own documents" ON storage.objects;

-- Create single comprehensive admin policy using has_role()
CREATE POLICY "Admins full access to dealer documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'dealer-documents' 
  AND has_role(auth.uid(), 'admin'::user_role)
)
WITH CHECK (
  bucket_id = 'dealer-documents' 
  AND has_role(auth.uid(), 'admin'::user_role)
);

-- Dealers can INSERT (upload) their own documents
CREATE POLICY "Dealers can upload their documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dealer-documents'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Dealers can SELECT (view/download) their own documents
CREATE POLICY "Dealers can view their documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'dealer-documents'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Note: Deliberately NO DELETE or UPDATE policies for dealers
-- Only admins can delete/update through their "full access" policy