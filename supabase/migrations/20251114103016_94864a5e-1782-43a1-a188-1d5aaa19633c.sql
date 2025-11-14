-- Drop the current policy that uses direct EXISTS check
DROP POLICY IF EXISTS "Admins can view all dealer documents" ON dealer_documents;

-- Recreate policy using the existing has_role() security definer function
CREATE POLICY "Admins can view all dealer documents"
ON dealer_documents
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));