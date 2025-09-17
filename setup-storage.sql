-- Create storage buckets for CivicSense

-- Issue Photos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'issue-photos', 
  'issue-photos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Issue Audio bucket (private with RLS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'issue-audio', 
  'issue-audio', 
  false,
  10485760, -- 10MB limit
  ARRAY['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for issue-photos bucket
CREATE POLICY "Anyone can view issue photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-photos');

CREATE POLICY "Authenticated users can upload issue photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'issue-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own issue photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'issue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own issue photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'issue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for issue-audio bucket
CREATE POLICY "Users can view own audio files" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'issue-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own audio files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'issue-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own audio files" ON storage.objects
  FOR DELETE USING (bucket_id = 'issue-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admin policies for all buckets
CREATE POLICY "Admins can manage all issue photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'issue-photos' AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage all audio files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'issue-audio' AND 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage all avatars" ON storage.objects
  FOR ALL USING (
    bucket_id = 'avatars' AND 
    auth.jwt() ->> 'role' = 'admin'
  );