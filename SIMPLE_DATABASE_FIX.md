# Database Diagnostic and Fix Script

## Step 1: Check Current Database State

First, run this diagnostic query to see what exists:

```sql
-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

```sql
-- Check issues table structure if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'issues' AND table_schema = 'public'
ORDER BY ordinal_position;
```

## Step 2: Simple Fix - Create Missing Issues Table

If the issues table doesn't exist or is incomplete, run this simplified script:

```sql
-- Drop and recreate issues table completely
DROP TABLE IF EXISTS public.issues CASCADE;

-- Create issues table with proper UUID types
CREATE TABLE public.issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL,
    department_id UUID,
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

-- Add foreign key constraints AFTER creating the other tables
-- We'll add these later in Step 3

-- Enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create policies with correct UUID comparison
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
CREATE INDEX idx_issues_created_at ON public.issues(created_at);
```

## Step 3: Create Categories and Departments (if needed)

```sql
-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
ALTER TABLE public.categories ADD CONSTRAINT unique_category_name UNIQUE (name);

-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    email TEXT,
    phone TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    jurisdiction TEXT,
    city TEXT,
    state TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
ALTER TABLE public.departments ADD CONSTRAINT unique_department_name UNIQUE (name);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT TO authenticated USING (true);

-- Now add foreign key constraints to issues table
ALTER TABLE public.issues 
ADD CONSTRAINT fk_issues_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.issues 
ADD CONSTRAINT fk_issues_department 
FOREIGN KEY (department_id) REFERENCES public.departments(id);
```

## Step 4: Add Sample Data

```sql
-- Insert categories (without ON CONFLICT for now)
INSERT INTO public.categories (name, description, color, icon) 
SELECT 'Infrastructure', 'Roads, bridges, buildings, and public works', '#F59E0B', '🏗️'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Infrastructure');

INSERT INTO public.categories (name, description, color, icon) 
SELECT 'Environment', 'Pollution, waste management, parks', '#10B981', '🌿'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Environment');

INSERT INTO public.categories (name, description, color, icon) 
SELECT 'Safety', 'Street lighting, security issues', '#EF4444', '🚨'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Safety');

INSERT INTO public.categories (name, description, color, icon) 
SELECT 'Transportation', 'Public transport, traffic management', '#8B5CF6', '🚌'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Transportation');

INSERT INTO public.categories (name, description, color, icon) 
SELECT 'Utilities', 'Water supply, electricity, gas services', '#0EA5E9', '⚡'
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Utilities');

-- Insert departments (with all required fields)
INSERT INTO public.departments (name, description, email, phone, contact_email, contact_phone, jurisdiction, city, state) 
SELECT 'Municipal Corporation', 'Urban civic services and governance', 'admin@municipal.gov.in', '+91-11-23456789', 'contact@municipal.gov.in', '+91-11-23456790', 'Urban Areas', 'New Delhi', 'Delhi'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Municipal Corporation');

INSERT INTO public.departments (name, description, email, phone, contact_email, contact_phone, jurisdiction, city, state) 
SELECT 'Public Works Department', 'State infrastructure development', 'pwd@gov.in', '+91-11-23456791', 'contact@pwd.gov.in', '+91-11-23456792', 'State Infrastructure', 'New Delhi', 'Delhi'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Public Works Department');

INSERT INTO public.departments (name, description, email, phone, contact_email, contact_phone, jurisdiction, city, state) 
SELECT 'Traffic Police', 'Traffic management and road safety', 'traffic@delhipolice.gov.in', '100', 'helpdesk@delhipolice.gov.in', '+91-11-23456793', 'Traffic Management', 'New Delhi', 'Delhi'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Traffic Police');

INSERT INTO public.departments (name, description, email, phone, contact_email, contact_phone, jurisdiction, city, state) 
SELECT 'Water Supply Department', 'Water distribution and management', 'water@delhi.gov.in', '+91-11-23456794', 'grievance@delhijal.gov.in', '+91-11-23456795', 'Water Supply', 'New Delhi', 'Delhi'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Water Supply Department');

INSERT INTO public.departments (name, description, email, phone, contact_email, contact_phone, jurisdiction, city, state) 
SELECT 'Electricity Board', 'Power distribution and services', 'info@bses.co.in', '19123', 'customer@bses.co.in', '+91-11-23456796', 'Power Distribution', 'New Delhi', 'Delhi'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE name = 'Electricity Board');
```

## Step 5: Test the Setup

```sql
-- Test query to verify everything works
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

If this query runs without errors and shows counts for all tables, your database is ready! 

## Key Changes Made:

1. ✅ **Removed ENUMs** - Using simple TEXT fields instead
2. ✅ **Added all required columns** - Including `status`, `latitude`, `longitude`
3. ✅ **Proper foreign keys** - Links between tables
4. ✅ **RLS policies** - Security for authenticated users
5. ✅ **Sample data** - Categories and departments to test with

**Try the form again after running this script - it should work perfectly!** 🚀