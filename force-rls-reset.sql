-- FORCE DROP ALL EXISTING POLICIES AND RECREATE
-- This script will completely reset the RLS policies for the issues table

-- Step 1: FORCE DROP all existing policies on issues table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on the issues table
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'issues' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.issues';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 2: Verify all policies are dropped
SELECT 'Policies after dropping:' as status;
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'issues'
ORDER BY policyname;

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Step 4: Create FRESH policies with proper names to avoid conflicts

-- Policy for SELECT (viewing issues)
CREATE POLICY "issues_select_policy" ON public.issues
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'department_head')
    )
  );

-- Policy for INSERT (creating issues)
CREATE POLICY "issues_insert_policy" ON public.issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (updating issues) - users can update their own
CREATE POLICY "issues_update_own_policy" ON public.issues
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (updating issues) - admins can update any
CREATE POLICY "issues_update_admin_policy" ON public.issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'department_head')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'department_head')
    )
  );

-- Policy for DELETE (deleting issues) - users can delete their own, admins can delete any
CREATE POLICY "issues_delete_policy" ON public.issues
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'department_head')
    )
  );

-- Step 5: Verify all policies were created
SELECT 'Final policies on issues table:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'issues'
ORDER BY policyname;

-- Step 6: Test query to verify permissions work
-- This should return issues if the user is authenticated
SELECT 'Test: Current user can see these issues:' as test;
SELECT COUNT(*) as visible_issues
FROM public.issues
WHERE auth.uid() = user_id
   OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'department_head'));