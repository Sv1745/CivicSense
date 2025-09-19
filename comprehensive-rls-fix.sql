-- Comprehensive RLS Policy Fix for Issues Table
-- This script handles existing policies and ensures proper permissions

-- Step 1: Check current policies (run this first to see what's there)
SELECT 'Current policies on issues table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'issues'
ORDER BY policyname;

-- Step 2: Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can update their own issues" ON public.issues;
DROP POLICY IF EXISTS "Admins can update any issue" ON public.issues;
DROP POLICY IF EXISTS "Users can update issues" ON public.issues;

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Step 4: Create proper policies with correct permissions

-- Policy 1: Allow users to update their own issues
CREATE POLICY "Users can update their own issues" ON public.issues
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow admins and department heads to update any issue
CREATE POLICY "Admins can update any issue" ON public.issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'department_head')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'department_head')
    )
  );

-- Policy 3: Allow users to view their own issues
CREATE POLICY "Users can view own issues" ON public.issues
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'department_head')
    )
  );

-- Policy 4: Allow authenticated users to insert issues
CREATE POLICY "Users can insert their own issues" ON public.issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 5: Verify the policies were created correctly
SELECT 'Updated policies on issues table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'issues'
ORDER BY policyname;

-- Step 6: Test the policies (optional - run this separately if needed)
-- This will show what the current user can see
SELECT 'Test query - current user can see these issues:' as info;
SELECT id, title, status, user_id
FROM public.issues
WHERE auth.uid() = user_id
   OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'department_head'))
LIMIT 5;