# CivicNetra Database Setup Guide

## Step 1: Set up Supabase Database Schema

You need to run this SQL script in your Supabase Dashboard SQL Editor.

**Go to**: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor → New Query

Copy and paste this complete schema:

```sql
-- CivicNetra Database Schema Setup for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist (to handle updates)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS issue_status CASCADE;
DROP TYPE IF EXISTS issue_priority CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;

-- Create custom types (Updated to match TypeScript types)
CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'department_head');
CREATE TYPE issue_status AS ENUM ('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed');

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
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table (Updated with all needed columns)
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    email TEXT,
    phone TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    jurisdiction TEXT,
    city TEXT,
    state TEXT,
    head_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table (Updated to match TypeScript types exactly)
CREATE TABLE IF NOT EXISTS public.issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    priority issue_priority DEFAULT 'medium',
    status issue_status DEFAULT 'submitted',
    verification_status verification_status DEFAULT 'pending',
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

-- Issue updates table
CREATE TABLE IF NOT EXISTS public.issue_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    message TEXT NOT NULL,
    status_change issue_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_user_id ON public.issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_category_id ON public.issues(category_id);
CREATE INDEX IF NOT EXISTS idx_issues_department_id ON public.issues(department_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to read categories and departments
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT TO authenticated USING (true);

-- Allow users to create issues
CREATE POLICY "Users can create issues" ON public.issues
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow users to read all issues (public information)
CREATE POLICY "Anyone can view issues" ON public.issues
    FOR SELECT TO authenticated USING (true);

-- Allow users to update their own issues
CREATE POLICY "Users can update own issues" ON public.issues
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);
```

## Step 2: Insert Initial Data

After running the schema, run this second script to populate categories and departments:

```sql
-- Seed Data for Categories and Departments

-- Insert Categories
INSERT INTO public.categories (name, description, color, icon) VALUES
('Infrastructure', 'Roads, bridges, buildings, and public works', '#F59E0B', '🏗️'),
('Environment', 'Pollution, waste management, parks', '#10B981', '🌿'),
('Safety', 'Street lighting, security issues', '#EF4444', '🚨'),
('Transportation', 'Public transport, traffic management', '#8B5CF6', '🚌'),
('Utilities', 'Water supply, electricity, gas services', '#0EA5E9', '⚡'),
('Healthcare', 'Public health services, hospitals', '#EC4899', '🏥'),
('Education', 'Schools, educational facilities', '#3B82F6', '🎓'),
('Civic Services', 'Municipal services, permits, documentation', '#6B7280', '🏛️')
ON CONFLICT (name) DO NOTHING;

-- Insert Indian Government Departments
INSERT INTO public.departments (name, description, email, phone, contact_email, contact_phone, jurisdiction, city, state) VALUES

-- Central Ministries
('Ministry of Road Transport & Highways', 'National highways, road infrastructure', 'morth@gov.in', '+91-11-23717264', 'morth@gov.in', '+91-11-23717264', 'National', 'New Delhi', 'Delhi'),
('Ministry of Environment & Forests', 'Environmental protection, forest conservation', 'moef@gov.in', '+91-11-24695134', 'moef@gov.in', '+91-11-24695134', 'National', 'New Delhi', 'Delhi'),
('Ministry of Railways', 'Railway infrastructure and operations', 'railways@gov.in', '+91-11-23389595', 'railways@gov.in', '+91-11-23389595', 'National', 'New Delhi', 'Delhi'),

-- State Level Departments
('Public Works Department', 'State infrastructure development and maintenance', 'pwd@state.gov.in', '+91-1070', 'pwd@state.gov.in', '+91-1070', 'State', 'State Capital', 'Various States'),
('Municipal Corporation', 'Urban civic services and governance', 'municipal@city.gov.in', '+91-1950', 'municipal@city.gov.in', '+91-1950', 'City', 'Major Cities', 'Various States'),
('Traffic Police Department', 'Traffic management and road safety', 'traffic@police.gov.in', '+91-103', 'traffic@police.gov.in', '+91-103', 'City', 'All Cities', 'Various States'),
('Water Supply Department', 'Water distribution and management', 'water@municipal.gov.in', '+91-1916', 'water@municipal.gov.in', '+91-1916', 'City', 'All Cities', 'Various States'),
('Electricity Board', 'Power distribution and services', 'electricity@state.gov.in', '+91-1912', 'electricity@state.gov.in', '+91-1912', 'State', 'State Capital', 'Various States'),
('Pollution Control Board', 'Environmental monitoring and control', 'pcb@state.gov.in', '+91-1800', 'pcb@state.gov.in', '+91-1800', 'State', 'State Capital', 'Various States'),
('Fire Department', 'Fire safety and emergency services', 'fire@emergency.gov.in', '+91-101', 'fire@emergency.gov.in', '+91-101', 'City', 'All Cities', 'Various States')

ON CONFLICT (name) DO NOTHING;
```

## Step 3: Test the Setup

After running both scripts, your database should be ready! The form should now work without errors.

## Step 4: Enable Storage (Optional)

If you want file uploads to work, also run the storage setup:

```sql
-- Storage Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('issue-photos', 'issue-photos', true, 5242880, '{"image/*"}'),
  ('issue-audio', 'issue-audio', false, 10485760, '{"audio/*"}'),
  ('avatars', 'avatars', true, 2097152, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Anyone can upload issue photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-photos');

CREATE POLICY "Anyone can view issue photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'issue-photos');

CREATE POLICY "Users can upload issue audio" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-audio');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'avatars');
```

## Troubleshooting

If you still get errors:

1. **Check if tables exist**: Go to Supabase Dashboard → Table Editor
2. **Verify data types**: Make sure enums match TypeScript definitions
3. **Check RLS policies**: Ensure your user has permission to insert data
4. **View logs**: Check Supabase Dashboard → Logs for detailed error messages

The form should work perfectly after running these scripts!