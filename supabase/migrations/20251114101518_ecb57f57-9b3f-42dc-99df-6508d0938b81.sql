-- Drop existing problematic policy
DROP POLICY IF EXISTS "Admins can view all documents" ON dealer_documents;

-- Create simplified policy with direct join to user_roles
CREATE POLICY "Admins can view all dealer documents"
ON dealer_documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::user_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'::user_role
  )
);