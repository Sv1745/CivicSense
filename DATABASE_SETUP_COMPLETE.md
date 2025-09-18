# Database Setup Guide for CivicSense

## Problem
You're getting the error: "Issue creation timed out after 15 seconds - this usually means database tables need to be set up"

This happens because your Supabase database doesn't have the required tables yet.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in and select your project: **ccdjkyqbnhsrwkmwizrq**

### Step 2: Open SQL Editor
1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to create a new SQL script

### Step 3: Run Database Schema Setup
Copy and paste the entire content from `supabase-setup.sql` into the SQL editor and run it.

**OR** you can run this comprehensive setup script:

```sql
-- CivicSense Database Schema Setup for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'department_head');
CREATE TYPE issue_status AS ENUM ('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE update_type AS ENUM ('status_change', 'assignment', 'comment', 'resolution');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    role user_role DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    jurisdiction TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    department_id UUID REFERENCES public.departments(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    priority issue_priority NOT NULL,
    status issue_status DEFAULT 'submitted',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    audio_url TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    resolution_notes TEXT,
    citizen_rating INTEGER CHECK (citizen_rating >= 1 AND citizen_rating <= 5),
    citizen_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Issue updates table
CREATE TABLE IF NOT EXISTS public.issue_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    update_type update_type NOT NULL,
    old_value TEXT,
    new_value TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for departments
CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify departments" ON public.departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for issues
CREATE POLICY "Users can view their own issues or admins can view all" ON public.issues
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'department_head')
        )
    );

CREATE POLICY "Users can insert their own issues" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update issues" ON public.issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'department_head')
        )
    );

-- RLS Policies for issue_updates
CREATE POLICY "Users can view updates for their issues or admins can view all" ON public.issue_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.issues 
            WHERE id = issue_id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'department_head')
        )
    );

CREATE POLICY "Authenticated users can insert updates" ON public.issue_updates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
    ('Roads & Infrastructure', 'Potholes, broken roads, traffic issues', '🛣️', '#3B82F6'),
    ('Water Supply', 'Water shortage, leakage, quality issues', '💧', '#06B6D4'),
    ('Electricity', 'Power outages, street lights, electrical issues', '⚡', '#F59E0B'),
    ('Waste Management', 'Garbage collection, cleanliness, sanitation', '🗑️', '#10B981'),
    ('Public Transport', 'Bus stops, metro, auto-rickshaw issues', '🚌', '#8B5CF6'),
    ('Street Lighting', 'Non-functional street lights, dark areas', '💡', '#F59E0B'),
    ('Public Safety', 'Crime, security concerns, police matters', '🚨', '#EF4444'),
    ('Parks & Recreation', 'Public parks, playgrounds, recreational facilities', '🌳', '#22C55E'),
    ('Healthcare', 'Public hospitals, health centers, medical facilities', '🏥', '#EC4899'),
    ('Education', 'Schools, colleges, educational infrastructure', '🎓', '#6366F1'),
    ('Other', 'Issues not covered in other categories', '📝', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Insert sample departments
INSERT INTO public.departments (name, description, contact_email, contact_phone, jurisdiction, state, city) VALUES
    ('BBMP Public Works', 'Bangalore public works department', 'works@bbmp.gov.in', '+91-80-12345678', 'BBMP', 'Karnataka', 'Bangalore'),
    ('Delhi PWD', 'Delhi Public Works Department', 'info@delhipwd.gov.in', '+91-11-23456789', 'Delhi PWD', 'Delhi', 'New Delhi'),
    ('MCGM Solid Waste', 'Mumbai solid waste management', 'waste@mcgm.gov.in', '+91-22-34567890', 'MCGM', 'Maharashtra', 'Mumbai'),
    ('Noida Authority Electrical', 'Noida electrical department', 'electrical@noidaauthority.com', '+91-120-4567890', 'Noida Authority', 'Uttar Pradesh', 'Noida'),
    ('Traffic Police', 'Traffic management and control', 'traffic@police.gov.in', '+91-100', 'Traffic Police', 'Multi-State', 'Various Cities'),
    ('Water Board', 'Water supply and management', 'info@waterboard.gov.in', '+91-1234567890', 'Water Board', 'Multi-State', 'Various Cities'),
    ('Municipal Corporation', 'General municipal services', 'info@municipal.gov.in', '+91-1800123456', 'Municipal Corp', 'Multi-State', 'Various Cities')
ON CONFLICT (name) DO NOTHING;
```

### Step 4: Set Up Storage (Optional - for photo/audio uploads)
If you want photo and audio upload functionality, also run the storage setup:

```sql
-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('issue-photos', 'issue-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('issue-audio', 'issue-audio', false, 10485760, ARRAY['audio/wav', 'audio/mpeg', 'audio/mp4']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow authenticated uploads to issue-photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'issue-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow public access to issue-photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'issue-photos');

CREATE POLICY "Allow authenticated uploads to issue-audio" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'issue-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated access to issue-audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'issue-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow public access to avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
```

### Step 5: Verify Setup
After running the script, you should see these tables in your Supabase dashboard:
- ✅ profiles
- ✅ categories  
- ✅ departments
- ✅ issues
- ✅ issue_updates
- ✅ notifications

### Step 6: Test the Application
Now try submitting an issue report - the timeout error should be resolved!

## Troubleshooting

If you still get errors after setup:

1. **Check table creation**: Go to Database > Tables in Supabase dashboard
2. **Verify RLS policies**: Go to Authentication > Policies
3. **Check for constraint errors**: Look at the browser console for detailed errors

## Quick Fix Alternative

If you prefer, you can run this single command in the Supabase SQL Editor:

```sql
-- Quick minimal setup for testing
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'department_head');
CREATE TYPE issue_status AS ENUM ('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    department_id UUID REFERENCES public.departments(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    priority issue_priority NOT NULL,
    status issue_status DEFAULT 'submitted',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Users can view own issues" ON public.issues FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own issues" ON public.issues FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO public.categories (name) VALUES ('General'), ('Infrastructure'), ('Public Safety') ON CONFLICT DO NOTHING;
INSERT INTO public.departments (name, state, city) VALUES ('General Department', 'General', 'General') ON CONFLICT DO NOTHING;
```

This should resolve your database timeout issue!