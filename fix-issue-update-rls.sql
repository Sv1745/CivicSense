-- Fix for issue update permissions
-- This script adds a policy allowing users to update their own issues

-- Enable RLS on issues table (if not already enabled)
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Add policy for users to update their own issues
CREATE POLICY "Users can update their own issues" ON public.issues
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'issues'
ORDER BY policyname;