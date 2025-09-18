-- CivicSense Database Schema Setup for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Test query to verify database connection
SELECT 'Database connection successful' as status;

-- Check if profiles table exists
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check RLS status on profiles table
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Create custom types (with safe handling for existing types)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'department_head');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_status AS ENUM ('submitted', 'under_review', 'in_progress', 'resolved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'disputed', 'false_report');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    email TEXT,
    phone TEXT,
    head_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issues table
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
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Safely drop and recreate triggers for updated_at
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
    ) THEN
        DROP TRIGGER profiles_updated_at ON public.profiles;
    END IF;
END $$;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'issues_updated_at'
    ) THEN
        DROP TRIGGER issues_updated_at ON public.issues;
    END IF;
END $$;
CREATE TRIGGER issues_updated_at
    BEFORE UPDATE ON public.issues
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
('Infrastructure', 'Roads, bridges, public buildings', '🏗️', '#3B82F6'),
('Environment', 'Pollution, waste management, parks', '🌿', '#10B981'),
('Safety', 'Street lighting, security issues', '🚨', '#EF4444'),
('Transportation', 'Traffic, public transport', '🚌', '#8B5CF6'),
('Utilities', 'Water, electricity, gas issues', '⚡', '#F59E0B'),
('Health & Sanitation', 'Public health, cleanliness', '🏥', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Insert default departments
INSERT INTO public.departments (name, description, email, phone) VALUES
('Public Works', 'Infrastructure and utilities management', 'publicworks@city.gov', '+1-555-0101'),
('Environmental Services', 'Waste management and environmental protection', 'environment@city.gov', '+1-555-0102'),
('Transportation Department', 'Traffic and public transportation', 'transport@city.gov', '+1-555-0103'),
('Public Safety', 'Security and emergency services', 'safety@city.gov', '+1-555-0104'),
('Health Department', 'Public health and sanitation', 'health@city.gov', '+1-555-0105'),
('Parks & Recreation', 'Parks, green spaces, and recreational facilities', 'parks@city.gov', '+1-555-0106')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify categories" ON public.categories;
CREATE POLICY "Only admins can modify categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for departments
DROP POLICY IF EXISTS "Anyone can view departments" ON public.departments;
CREATE POLICY "Anyone can view departments" ON public.departments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify departments" ON public.departments;
CREATE POLICY "Only admins can modify departments" ON public.departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for issues
DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;
CREATE POLICY "Anyone can view issues" ON public.issues
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own issues" ON public.issues;
CREATE POLICY "Users can create their own issues" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own issues" ON public.issues;
CREATE POLICY "Users can update their own issues" ON public.issues
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and department heads can update any issue" ON public.issues;
CREATE POLICY "Admins and department heads can update any issue" ON public.issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'department_head')
        )
    );

-- RLS Policies for issue_updates
DROP POLICY IF EXISTS "Anyone can view issue updates" ON public.issue_updates;
CREATE POLICY "Anyone can view issue updates" ON public.issue_updates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create issue updates" ON public.issue_updates;
CREATE POLICY "Authenticated users can create issue updates" ON public.issue_updates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for issue attachments
-- Create all required storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-attachments', 'issue-attachments', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-photos', 'issue-photos', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-audio', 'issue-audio', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop existing ones first)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'issue-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view all files" ON storage.objects;
CREATE POLICY "Users can view all files" ON storage.objects
    FOR SELECT USING (bucket_id = 'issue-attachments');

DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'issue-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (bucket_id = 'issue-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration (handle existing trigger safely)
DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable real-time for all tables
-- Safely add tables to supabase_realtime publication
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'issues'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.issues';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'issue_updates'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_updates';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
    ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles';
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';