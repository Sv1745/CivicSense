# Minimal Database Setup - No Conflicts

## Run This Complete Script in One Go

Copy and paste this entire script into your Supabase SQL Editor:

```sql
-- Complete database setup - run all at once
-- This avoids all constraint and conflict errors

-- Drop tables if they exist (start fresh)
DROP TABLE IF EXISTS public.issues CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table
CREATE TABLE public.issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    department_id UUID REFERENCES public.departments(id),
    user_id UUID NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'submitted',
    verification_status TEXT DEFAULT 'pending',
    photo_urls TEXT[],
    audio_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    vote_count INTEGER DEFAULT 0,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create issues" ON public.issues
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view issues" ON public.issues
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own issues" ON public.issues
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_issues_user_id ON public.issues(user_id);
CREATE INDEX idx_issues_category_id ON public.issues(category_id);
CREATE INDEX idx_issues_department_id ON public.issues(department_id);
CREATE INDEX idx_issues_status ON public.issues(status);

-- Insert sample categories
INSERT INTO public.categories (name, description, color, icon) VALUES
('Infrastructure', 'Roads, bridges, buildings, and public works', '#F59E0B', '🏗️'),
('Environment', 'Pollution, waste management, parks', '#10B981', '🌿'),
('Safety', 'Street lighting, security issues', '#EF4444', '🚨'),
('Transportation', 'Public transport, traffic management', '#8B5CF6', '🚌'),
('Utilities', 'Water supply, electricity, gas services', '#0EA5E9', '⚡');

-- Insert sample departments
INSERT INTO public.departments (name, description, email, phone, city, state) VALUES
('Municipal Corporation', 'Urban civic services and governance', 'municipal@city.gov.in', '+91-1950', 'Major Cities', 'Various States'),
('Public Works Department', 'State infrastructure development', 'pwd@state.gov.in', '+91-1070', 'State Capital', 'Various States'),
('Traffic Police', 'Traffic management and road safety', 'traffic@police.gov.in', '+91-103', 'All Cities', 'Various States'),
('Water Supply Department', 'Water distribution and management', 'water@municipal.gov.in', '+91-1916', 'All Cities', 'Various States'),
('Electricity Board', 'Power distribution and services', 'electricity@state.gov.in', '+91-1912', 'State Capital', 'Various States');
```

## Test Query

After running the script, test with this:

```sql
-- Verify everything is working
SELECT 
    'categories' as table_name, 
    count(*) as row_count 
FROM public.categories
UNION ALL
SELECT 
    'departments' as table_name, 
    count(*) as row_count 
FROM public.departments
UNION ALL
SELECT 
    'issues' as table_name, 
    count(*) as row_count 
FROM public.issues;
```

You should see:
- categories: 5 rows
- departments: 5 rows  
- issues: 0 rows (empty, ready for new submissions)

## What This Script Does:

✅ **Starts Fresh**: Drops existing tables to avoid conflicts  
✅ **Proper Structure**: All tables with correct columns and types  
✅ **Built-in Constraints**: UNIQUE constraints included in CREATE TABLE  
✅ **Foreign Keys**: Direct references in table creation  
✅ **RLS Policies**: Security policies for authenticated users  
✅ **Sample Data**: Ready-to-use categories and departments  
✅ **No Conflicts**: Simple INSERT statements without ON CONFLICT  

**Run this script and your form should work immediately!** 🚀