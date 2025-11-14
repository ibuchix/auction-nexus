-- Add storage policies for admins to view dealer documents
-- Admins with proper role can view all dealer documents
CREATE POLICY "Admins can view dealer documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'dealer-documents' 
  AND public.has_role(auth.uid(), 'admin'::user_role)
);

-- Admins can download dealer documents
CREATE POLICY "Admins can download dealer documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'dealer-documents' 
  AND public.has_role(auth.uid(), 'admin'::user_role)
);