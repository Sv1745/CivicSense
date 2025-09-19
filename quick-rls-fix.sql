-- Quick RLS Fix - Copy this entire script and run it in Supabase SQL Editor

-- Enable RLS (just in case)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view all issues" ON issues;
DROP POLICY IF EXISTS "Users can insert their own issues" ON issues;
DROP POLICY IF EXISTS "Users can update their own issues" ON issues;
DROP POLICY IF EXISTS "Admins can update any issue" ON issues;
DROP POLICY IF EXISTS "Department heads can update department issues" ON issues;
DROP POLICY IF EXISTS "Admins can insert issues" ON issues;

-- Create simple working policies
CREATE POLICY "allow_all_select" ON issues FOR SELECT USING (true);
CREATE POLICY "allow_admin_all" ON issues FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "allow_user_own" ON issues FOR ALL USING (auth.uid() = user_id);

-- Check if policies were created
SELECT policyname FROM pg_policies WHERE tablename = 'issues';