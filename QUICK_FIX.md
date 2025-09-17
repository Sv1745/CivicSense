# Quick Database Fix Script

If you're getting "type already exists" errors, use this simpler script instead:

## Option 1: Fix Existing Schema (Recommended)

Run this if you want to keep existing data and just fix the schema:

```sql
-- Fix existing database schema without dropping tables
-- Run this in Supabase SQL Editor

-- Create missing columns if they don't exist
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS jurisdiction TEXT;

-- Update existing enum values to match our TypeScript types
-- Note: This may fail if you have existing data with different values
-- In that case, use the full reset script instead

-- Create missing tables if they don't exist
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

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'submitted',
    verification_status TEXT DEFAULT 'pending',
    photo_urls TEXT[],
    audio_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    vote_count INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create issues" ON public.issues
    FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Anyone can view issues" ON public.issues
    FOR SELECT TO authenticated USING (true);
```

## Option 2: Complete Reset (Use if Option 1 fails)

⚠️ **WARNING**: This will delete all existing data!

```sql
-- Complete database reset - DELETES ALL DATA
-- Only use if you want to start fresh

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.issue_updates CASCADE;
DROP TABLE IF EXISTS public.issues CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- Then run the full schema from DATABASE_SETUP_GUIDE.md
```

## Quick Test

After running either script, test with this simple query:

```sql
-- Test if everything works
SELECT 
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public' 
    AND t.table_name IN ('issues', 'categories', 'departments', 'profiles')
ORDER BY t.table_name, c.ordinal_position;
```

This should show all your tables and columns. If you see the `issues` table with a `latitude` column, you're ready to test the form!