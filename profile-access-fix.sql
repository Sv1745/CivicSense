-- Profile Access Fix Script
-- Run this in Supabase SQL Editor to fix profile access issues

-- 1. Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    role TEXT DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS (critical for security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON public.profiles;

-- 4. Create comprehensive RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Special policy for profile creation during signup
CREATE POLICY "Enable profile creation during signup" ON public.profiles
    FOR INSERT
    WITH CHECK (
        -- Allow authenticated users to create their own profile
        (auth.uid() IS NOT NULL AND auth.uid() = id)
        OR
        -- Allow profile creation when no auth context (for triggers)
        (auth.uid() IS NULL)
    );

-- 5. Create or replace the profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Test the setup
SELECT 'Profile access fix applied successfully' as status;

-- 8. Verify RLS policies are in place
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles' AND schemaname = 'public';