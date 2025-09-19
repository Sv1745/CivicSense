-- Check current RLS policies on issues table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'issues'
ORDER BY policyname;