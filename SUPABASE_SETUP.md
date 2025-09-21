# 🚀 Supabase Setup Guide for CivicNetra

Follow these steps to configure your Supabase database for real-time data storage.

## 📋 Prerequisites
- ✅ Supabase account created
- ✅ New Supabase project created
- ✅ Project URL and Anon Key added to `.env.local`

## 🗄️ Step 1: Set Up Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `CivicNetra`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **"+ New Query"**
5. Copy and paste the entire contents of `supabase-setup.sql` into the editor
6. Click **"Run"** to execute the script

This will create:
- All necessary tables with proper relationships
- Row Level Security (RLS) policies
- Real-time subscriptions
- Default categories and departments
- Storage bucket for file uploads
- Automatic profile creation trigger

## 🔐 Step 2: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider:
   - Click on **Google**
   - Toggle **"Enable Google provider"**
   - Add your Google OAuth credentials:
     - **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com/)
     - **Client Secret**: Get from Google Cloud Console
   - Add authorized redirect URLs:
     - `http://localhost:3000/auth/callback` (development)
     - `your-production-domain.com/auth/callback` (production)
3. Configure **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (development)
   - **Redirect URLs**: 
     - `http://localhost:3000/**`
     - `your-production-domain.com/**`

## 🔄 Step 3: Enable Real-time Features

**Note**: The Replication UI is still coming soon in Supabase Dashboard.

### Method 1: Real-time is Already Enabled (Recommended)
The `supabase-setup.sql` script already includes the real-time setup at the end:
```sql
-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
```

### Method 2: Manual SQL Setup (If Method 1 Didn't Work)
If real-time isn't working, run this in **SQL Editor**:

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a **New Query** and run:
```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_updates; 
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Reload the schema
NOTIFY pgrst, 'reload schema';
```

### Method 3: Alternative - Use Database Settings
1. Go to **Settings** → **Database**
2. Scroll down to **Real-time** section
3. Add the following tables to real-time:
   - `public.issues`
   - `public.issue_updates`
   - `public.notifications`
   - `public.profiles`

**✅ Verification**: Real-time is working when you see WebSocket connections in your browser's Network tab.

## 📁 Step 4: Configure File Storage

1. Go to **Storage** 
2. The `issue-attachments` bucket should already be created by the SQL script
3. Verify the bucket exists and has proper policies

## 🧪 Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console - you should see:
   - No more "🎭 Demo Mode" messages
   - Supabase connection established
   - Real-time subscriptions active

3. Test key features:
   - **Sign up/Login** with Google OAuth
   - **Create an issue** (should store in Supabase)
   - **Real-time updates** (open admin dashboard in another tab)
   - **File uploads** (photos/audio in issue reports)

## 🔍 Verification Checklist

- [ ] Database schema created successfully (no SQL errors)
- [ ] Google OAuth working (can sign in)
- [ ] Issues are stored in Supabase (check Database → Tables → issues)
- [ ] Real-time updates working (new issues appear instantly in admin dashboard)
- [ ] File uploads working (photos stored in Storage → issue-attachments)
- [ ] User profiles created automatically on signup

## 🚨 Troubleshooting

### Common Issues:

1. **"Demo Mode still active"**
   - Check `.env.local` has correct Supabase URL and key
   - Restart development server after env changes

2. **Authentication not working**
   - Verify Google OAuth credentials in Supabase dashboard
   - Check redirect URLs match exactly
   - Ensure Site URL is set correctly

3. **Real-time not working**
   - Verify tables are enabled for replication
   - Check browser network tab for websocket connections
   - Ensure RLS policies allow data access

4. **File uploads failing**
   - Verify `issue-attachments` bucket exists
   - Check storage policies allow uploads
   - Ensure authenticated users have proper access

## 📊 Database Tables Overview

| Table | Purpose | Real-time |
|-------|---------|-----------|
| `profiles` | User information | ✅ |
| `categories` | Issue categories | ❌ |
| `departments` | Government departments | ❌ |
| `issues` | Civic issues | ✅ |
| `issue_updates` | Issue progress updates | ✅ |
| `notifications` | User notifications | ✅ |

## 🎯 Next Steps

Once setup is complete:
1. Your app will automatically use Supabase instead of localStorage
2. All data will persist in your Supabase database
3. Real-time updates will work across all connected clients
4. Google OAuth will handle user authentication
5. Files will be stored in Supabase Storage

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase dashboard logs
2. Verify all environment variables are set
3. Ensure database schema was created without errors
4. Test authentication flow step by step