-- Complete RLS Policy Reset and Recreation for Issues Table
-- This script will drop all existing policies and create new ones that work

-- Step 1: Enable RLS on issues table (if not already enabled)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on issues table
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN
        SELECT polname
        FROM pg_policies
        WHERE tablename = 'issues'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON issues', policy_name);
        RAISE NOTICE 'Dropped policy: %', policy_name;
    END LOOP;
END $$;

-- Step 3: Create new policies for issues table

-- Policy 1: Allow users to view all issues (for public access)
CREATE POLICY "Users can view all issues"
ON issues FOR SELECT
USING (true);

-- Policy 2: Allow authenticated users to insert their own issues
CREATE POLICY "Users can insert their own issues"
ON issues FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to update their own issues
CREATE POLICY "Users can update their own issues"
ON issues FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow admins to view all issues (already covered by policy 1)

-- Policy 5: Allow admins to update any issue
CREATE POLICY "Admins can update any issue"
ON issues FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy 6: Allow department heads to update issues in their department
CREATE POLICY "Department heads can update department issues"
ON issues FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'department_head'
        AND profiles.id = issues.assigned_to
    )
);

-- Policy 7: Allow admins to insert issues (for testing/admin purposes)
CREATE POLICY "Admins can insert issues"
ON issues FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Step 4: Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'issues'
ORDER BY policyname;