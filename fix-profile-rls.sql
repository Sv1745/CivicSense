-- Fix the RLS policy for profile creation
-- Drop the existing problematic insert policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create a proper policy that allows users to insert their own profile
-- This checks that the user is authenticated AND the profile ID matches their auth.uid()
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Also ensure there's a policy for the database trigger to work
-- The trigger runs with elevated privileges, so we need a more permissive policy
-- But we still want to ensure security
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is authenticated and inserting their own profile
    (auth.uid() IS NOT NULL AND auth.uid() = id)
    OR 
    -- Allow if this is being called by the trigger (no auth context)
    -- In this case, we trust the trigger validation
    (auth.uid() IS NULL AND id IS NOT NULL)
  );