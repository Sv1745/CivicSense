-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('citizen', 'admin', 'department_head');
create type issue_priority as enum ('low', 'medium', 'high', 'urgent');
create type issue_status as enum ('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed');
create type update_type as enum ('status_change', 'assignment', 'comment', 'resolution');
create type notification_type as enum ('info', 'warning', 'success', 'error');

-- Create profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  city text,
  state text,
  role user_role default 'citizen',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create departments table
create table public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  contact_email text,
  contact_phone text,
  jurisdiction text not null,
  state text not null,
  city text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create issues table
create table public.issues (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  category_id uuid references public.categories(id) not null,
  department_id uuid references public.departments(id) not null,
  user_id uuid references public.profiles(id) not null,
  priority issue_priority not null,
  status issue_status default 'submitted',
  location jsonb not null, -- {lat: number, lng: number}
  address text not null,
  photos text[], -- Array of storage URLs
  voice_note_url text,
  assigned_to uuid references public.profiles(id),
  resolution_notes text,
  citizen_rating integer check (citizen_rating >= 1 and citizen_rating <= 5),
  citizen_feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- Create issue_updates table for tracking changes
create table public.issue_updates (
  id uuid default uuid_generate_v4() primary key,
  issue_id uuid references public.issues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  update_type update_type not null,
  old_value text,
  new_value text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  issue_id uuid references public.issues(id) on delete cascade,
  title text not null,
  message text not null,
  type notification_type default 'info',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_issues_updated_at before update on public.issues
  for each row execute procedure update_updated_at_column();

-- Create indexes for better performance
create index idx_issues_user_id on public.issues(user_id);
create index idx_issues_category_id on public.issues(category_id);
create index idx_issues_department_id on public.issues(department_id);
create index idx_issues_status on public.issues(status);
create index idx_issues_created_at on public.issues(created_at);
create index idx_issue_updates_issue_id on public.issue_updates(issue_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.departments enable row level security;
alter table public.issues enable row level security;
alter table public.issue_updates enable row level security;
alter table public.notifications enable row level security;

-- Create RLS policies

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Enable insert for authenticated users only" on public.profiles
  for insert with check (auth.role() = 'authenticated');

-- Categories: Everyone can read, only admins can modify
create policy "Anyone can view categories" on public.categories
  for select using (true);

create policy "Only admins can insert categories" on public.categories
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'department_head')
    )
  );

create policy "Only admins can update categories" on public.categories
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'department_head')
    )
  );

-- Departments: Everyone can read, only admins can modify
create policy "Anyone can view departments" on public.departments
  for select using (true);

create policy "Only admins can insert departments" on public.departments
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'department_head')
    )
  );

create policy "Only admins can update departments" on public.departments
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'department_head')
    )
  );

-- Issues: Users can view their own issues, admins can view all
create policy "Users can view own issues" on public.issues
  for select using (
    auth.uid() = user_id or 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'department_head')
    )
  );

create policy "Users can insert their own issues" on public.issues
  for insert with check (auth.uid() = user_id);

create policy "Admins can update any issue" on public.issues
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'department_head')
    )
  );

-- Issue updates: Users can view updates for their issues, admins can view all
create policy "Users can view updates for their issues" on public.issue_updates
  for select using (
    exists (
      select 1 from public.issues
      where id = issue_id and user_id = auth.uid()
    ) or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'department_head')
    )
  );

create policy "Authenticated users can insert updates" on public.issue_updates
  for insert with check (auth.uid() = user_id);

-- Notifications: Users can only view their own notifications
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "System can insert notifications" on public.notifications
  for insert with check (true);

-- Insert default categories
insert into public.categories (name, description, icon, color) values
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
  ('Other', 'Issues not covered in other categories', '📝', '#6B7280');

-- Insert sample departments (you can modify these based on actual requirements)
insert into public.departments (name, description, contact_email, contact_phone, jurisdiction, state, city) values
  ('BBMP Public Works', 'Bangalore public works department', 'works@bbmp.gov.in', '+91-80-12345678', 'BBMP', 'Karnataka', 'Bangalore'),
  ('Delhi PWD', 'Delhi Public Works Department', 'info@delhipwd.gov.in', '+91-11-23456789', 'Delhi PWD', 'Delhi', 'New Delhi'),
  ('MCGM Solid Waste', 'Mumbai solid waste management', 'waste@mcgm.gov.in', '+91-22-34567890', 'MCGM', 'Maharashtra', 'Mumbai'),
  ('Noida Authority Electrical', 'Noida electrical department', 'electrical@noidaauthority.com', '+91-120-4567890', 'Noida Authority', 'Uttar Pradesh', 'Noida'),
  ('Traffic Police', 'Traffic management and control', 'traffic@police.gov.in', '+91-100', 'Traffic Police', 'Multi-State', 'Various Cities'),
  ('Water Board', 'Water supply and management', 'info@waterboard.gov.in', '+91-1234567890', 'Water Board', 'Multi-State', 'Various Cities'),
  ('Municipal Corporation', 'General municipal services', 'info@municipal.gov.in', '+91-1800123456', 'Municipal Corp', 'Multi-State', 'Various Cities');

-- Create function to handle user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Create trigger for automatic profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();