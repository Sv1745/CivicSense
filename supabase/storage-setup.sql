-- Supabase Storage Setup for CivicSense

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('issue-photos', 'issue-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('issue-audio', 'issue-audio', false, 10485760, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

-- Storage policies for issue-photos bucket (public read access)
CREATE POLICY "Public read access for issue photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issue-photos');

CREATE POLICY "Authenticated users can upload issue photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'issue-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own issue photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'issue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own issue photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'issue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for issue-audio bucket (private, only authenticated users)
CREATE POLICY "Users can read their own audio files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issue-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload audio files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'issue-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own audio files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'issue-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'issue-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket (public read, user upload)
CREATE POLICY "Public read access for avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Additional policies for admins to access all files
CREATE POLICY "Admins can access all issue photos" 
ON storage.objects FOR ALL 
USING (bucket_id = 'issue-photos' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can access all audio files" 
ON storage.objects FOR ALL 
USING (bucket_id = 'issue-audio' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins can access all avatars" 
ON storage.objects FOR ALL 
USING (bucket_id = 'avatars' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));