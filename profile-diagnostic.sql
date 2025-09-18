-- Profile Access Diagnostic Script
-- Run this in Supabase SQL Editor to diagnose profile access issues

-- 1. Test database connection
SELECT 'Database connection successful' as status;

-- 2. Check if profiles table exists
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 3. Check RLS status on profiles table
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 4. Check existing RLS policies on profiles table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles' AND schemaname = 'public';

-- 5. Check if user_role type exists
SELECT
  n.nspname as schema_name,
  t.typname as type_name,
  string_agg(e.enumlabel, ', ') as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE t.typname = 'user_role'
GROUP BY n.nspname, t.typname;

-- 6. Check current user authentication context
SELECT
  auth.uid() as current_user_id,
  auth.jwt() ->> 'email' as current_user_email;

-- 7. Test profile access (this should work if RLS is configured correctly)
SELECT
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE id = auth.uid()) as my_profile_count
FROM public.profiles;

-- 8. Check for any existing profiles
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
LIMIT 5;