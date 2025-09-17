# Supabase Storage Setup

## Required Storage Buckets

Your CivicSense app needs these storage buckets in Supabase for file uploads to work:

### 1. issue-photos
For storing issue report photos

### 2. issue-audio  
For storing voice notes

### 3. avatars
For user profile pictures

## Quick Setup Script

Copy and paste this into your Supabase SQL Editor to create the buckets:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('issue-photos', 'issue-photos', true),
  ('issue-audio', 'issue-audio', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for issue-photos bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'issue-photos');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-photos');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for issue-audio bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'issue-audio');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-audio');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Set up storage policies for avatars bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## Alternative: Create via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click on "Storage" in the left sidebar
3. Click "New bucket" 
4. Create these buckets:
   - **issue-photos** (Public: Yes)
   - **issue-audio** (Public: Yes) 
   - **avatars** (Public: Yes)

## Testing Storage

Once buckets are created, your app will automatically detect them and enable file uploads. The form will show success messages when uploads work properly.

## Current Behavior

**Without storage buckets configured:**
- ✅ Issue reports are still submitted successfully
- ⚠️ Photos and voice notes are not uploaded
- ℹ️ Users get friendly notifications about upload limitations

**With storage buckets configured:**
- ✅ Issue reports submitted successfully
- ✅ Photos uploaded and attached to issues
- ✅ Voice notes uploaded and attached to issues
- ✅ Progress indicators work properly