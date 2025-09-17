# CivicSense Storage Setup Guide

## Issue: Document Uploads Stuck at 10%

This issue occurs when Supabase storage buckets are not properly configured. Follow these steps to fix it:

## Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Navigate to your CivicSense project

## Step 2: Create Storage Buckets

1. Go to **Storage** in the left sidebar
2. Click **Create Bucket** for each of these:
   - `issue-photos` (Public bucket)
   - `issue-audio` (Private bucket) 
   - `avatars` (Public bucket)

## Step 3: Run Storage Setup SQL

1. Go to **SQL Editor** in the left sidebar
2. Create a new query
3. Copy and paste the content from `setup-storage.sql` file
4. Click **Run** to execute the query

## Step 4: Verify Bucket Configuration

### issue-photos bucket:
- **Public**: Yes
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp, image/jpg

### issue-audio bucket:
- **Public**: No
- **File size limit**: 10MB  
- **Allowed MIME types**: audio/wav, audio/mpeg, audio/mp3, audio/webm

### avatars bucket:
- **Public**: Yes
- **File size limit**: 2MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp, image/jpg

## Step 5: Test Storage

1. Run your application: `npm run dev`
2. Go to **Admin Dashboard** → **Database Setup** tab
3. Click **Test Upload** in the Storage Diagnostics section
4. If successful, try uploading a document in the issue report form

## Common Issues & Solutions

### Error: "Storage not available"
- Verify your Supabase project is not paused
- Check internet connection
- Ensure storage is enabled in your Supabase project

### Error: "Bucket not found"
- Create the missing storage buckets manually
- Run the setup-storage.sql script

### Error: "Policy violation"
- Check Row Level Security (RLS) policies
- Ensure authenticated users have upload permissions
- Verify user authentication is working

### Error: "File too large"
- Check file size limits in bucket configuration
- Compress images/audio files if needed
- Update limits in the SQL setup script

## Testing Checklist

✅ All three storage buckets exist
✅ Storage policies are configured
✅ File size limits are appropriate  
✅ MIME types are correctly set
✅ Authentication is working
✅ Test upload succeeds

## Need Help?

If uploads are still failing:
1. Check browser console for detailed error messages
2. Verify Supabase project settings
3. Test with smaller files first
4. Use the diagnostic tools in the admin dashboard