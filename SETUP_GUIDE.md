# CivicNetra Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- Google Cloud Console account (for Google Maps and OAuth)

## 1. Supabase Setup

### Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name (e.g., "CivicNetra")
3. Set a secure database password
4. Choose your preferred region

### Database Schema Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql` into the editor
3. Run the query to create all tables with proper relationships and RLS policies

### Storage Buckets Setup

1. Go to Storage in your Supabase dashboard
2. Copy and paste the contents of `supabase/storage-setup.sql` into the SQL Editor
3. Run the query to create storage buckets and policies

### Get Your Supabase Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy your:
   - Project URL
   - Anon public key

## 2. Google Services Setup

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### Google OAuth Setup

1. In Google Cloud Console, go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Add your domain to authorized origins
4. Add the following redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

## 3. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Authentication Configuration

### Configure Supabase Auth

1. Go to Authentication > Providers in Supabase dashboard
2. Enable Google OAuth provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Set redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

### Auth Callback Route

The project includes an auth callback route at `src/app/auth/callback/route.ts` that handles the OAuth flow.

## 5. Installation and Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 6. Initial Data Setup

### Create Categories

Run the following SQL in Supabase SQL Editor to create initial categories:

```sql
INSERT INTO categories (name, description, icon, color) VALUES 
  ('Infrastructure', 'Roads, bridges, public buildings', '🏗️', '#3B82F6'),
  ('Environment', 'Pollution, waste management, parks', '🌿', '#10B981'),
  ('Safety', 'Street lighting, security issues', '🚨', '#EF4444'),
  ('Transportation', 'Traffic, public transport', '🚌', '#8B5CF6'),
  ('Utilities', 'Water, electricity, sewage', '⚡', '#F59E0B'),
  ('Health', 'Healthcare facilities, sanitation', '🏥', '#EC4899');
```

### Create Departments

```sql
INSERT INTO departments (name, description, jurisdiction, state, city, contact_email) VALUES 
  ('Municipal Corporation', 'City administration and civic services', 'City', 'Your State', 'Your City', 'admin@municipality.gov'),
  ('Public Works', 'Infrastructure and construction', 'City', 'Your State', 'Your City', 'works@municipality.gov'),
  ('Environment Department', 'Environmental protection and waste management', 'State', 'Your State', 'Your City', 'env@state.gov'),
  ('Police Department', 'Law enforcement and public safety', 'City', 'Your State', 'Your City', 'police@city.gov');
```

## 7. Admin User Setup

### Create Your First Admin User

1. Sign up through the application
2. Go to Supabase dashboard > Table Editor > profiles
3. Find your user record and change the `role` from `citizen` to `admin`

## 8. Production Deployment

### Environment Variables for Production

Update your `.env.local` with production URLs:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Supabase Configuration for Production

1. Update redirect URLs in Supabase Auth settings
2. Update CORS settings if needed
3. Review RLS policies for production security

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

## 9. Features Overview

### For Citizens
- Report civic issues with photos and voice notes
- Track issue status and updates
- View nearby issues on map
- Receive notifications on issue progress

### For Admins
- Real-time dashboard with metrics
- Manage and assign issues
- User management
- Department configuration
- Analytics and reporting

### For Department Heads
- View department-specific issues
- Assign issues to team members
- Update issue status and resolution

## 10. Customization

### Adding New Issue Categories

1. Add new categories in Supabase categories table
2. Update the category icons in the form components

### Modifying User Roles

Edit the role enum in `src/lib/database.types.ts` and update the corresponding Supabase schema.

### Custom Notification Types

Add new notification types in the database schema and update the notification service.

## 11. Troubleshooting

### Common Issues

1. **Authentication not working**: Check Google OAuth configuration and redirect URLs
2. **Maps not loading**: Verify Google Maps API key and enabled APIs
3. **File uploads failing**: Check Supabase storage bucket policies
4. **Real-time not working**: Ensure Supabase project has real-time enabled

### Debug Mode

Set `NODE_ENV=development` to enable debug logging.

## 12. Security Considerations

1. **Row Level Security**: All database tables have RLS enabled
2. **File Upload Security**: Storage buckets have proper access policies
3. **API Keys**: Keep all API keys secure and use environment variables
4. **User Roles**: Implement proper role-based access control

## 13. Support

For issues and questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check Google Cloud Console for API usage and errors
4. Ensure all environment variables are correctly set

---

This setup guide will get your CivicNetra platform up and running with full Supabase integration, real-time features, and comprehensive civic issue management capabilities.