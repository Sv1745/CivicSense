-- Migration script to fix profile RLS policy
-- Run this in your Supabase SQL editor

-- Drop the problematic existing policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create the corrected policy
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile';