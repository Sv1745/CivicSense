-- Quick Profile Check Script
-- Run this in Supabase SQL Editor to verify profile setup

-- Check if profiles table exists
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check profiles table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies on profiles
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

-- Check if there are any profiles in the table
SELECT
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE role = 'citizen') as citizen_count,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count
FROM public.profiles;

-- Show a few sample profiles (without sensitive data)
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
LIMIT 3;