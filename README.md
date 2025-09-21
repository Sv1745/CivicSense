# CivicNetra - Smart Civic Issue Reporting Platform

A comprehensive Next.js application for civic issue reporting and management, built with Supabase backend, real-time updates, and modern UI components.

## 🌟 Features

### For Citizens
- **Issue Reporting**: Report civic issues with photos, voice notes, and location
- **Real-time Tracking**: Track your reported issues with live status updates
- **Interactive Map**: View nearby issues and their current status
- **Notifications**: Get notified when your issues are acknowledged or resolved
- **User Profiles**: Manage your profile and view your reporting history

### For Administrators
- **Real-time Dashboard**: Live metrics and analytics with instant updates
- **Issue Management**: Assign, update, and resolve civic issues
- **User Management**: Manage citizen and department user accounts
- **Priority Alerts**: Immediate alerts for urgent issues requiring attention
- **Export Data**: Generate reports and export data for analysis

### For Department Heads
- **Department View**: See issues specific to your department
- **Team Management**: Assign issues to team members
- **Status Updates**: Update citizens on issue progress
- **Performance Metrics**: Track department response times and resolution rates

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **React Hook Form** - Form handling with validation
- **Zod** - Runtime type validation

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level security policies
- **Real-time Updates** - Live data synchronization
- **File Storage** - Secure photo and audio file handling

### APIs & Services
- **Supabase Auth** - Authentication with Google OAuth
- **Google Maps API** - Location services and mapping
- **Voice Recording** - Browser-based audio capture

## 📋 Complete Feature Set

### Authentication & Security
- ✅ Google OAuth integration
- ✅ User role management (Citizen, Admin, Department Head)
- ✅ Session management and persistence
- ✅ Row-level security policies
- ✅ Secure file upload and storage

### Issue Management
- ✅ Comprehensive issue reporting form
- ✅ Photo uploads with progress tracking
- ✅ Voice note recordings
- ✅ GPS location capture
- ✅ Priority levels and categorization
- ✅ Department assignment
- ✅ Status tracking workflow

### Real-time Features
- ✅ Live dashboard updates
- ✅ Instant notifications
- ✅ Real-time issue status changes
- ✅ Live user activity tracking
- ✅ Dynamic metrics and analytics

### Admin Panel
- ✅ Comprehensive admin dashboard
- ✅ Issue management interface
- ✅ User profile management
- ✅ Department configuration
- ✅ Analytics and reporting
- ✅ Priority issue alerts

### Data Management
- ✅ Complete database schema
- ✅ Data relationships and constraints
- ✅ Automated timestamps
- ✅ Soft deletes and archiving
- ✅ Data export capabilities

## 🚦 Getting Started

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Run development server  
npm run dev
```

## 🎯 Key Achievements

✅ **Complete Supabase Integration** - Full migration from Firebase  
✅ **Real-time Features** - Live updates and notifications  
✅ **Advanced Forms** - File uploads, voice notes, validation  
✅ **Admin Dashboard** - Comprehensive management interface  
✅ **Type Safety** - Full TypeScript implementation  
✅ **Security** - Row-level security and proper authentication  

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components  
├── lib/                # Database and utility functions
├── hooks/              # Custom React hooks
└── contexts/           # Authentication and state management
```

**CivicNetra** - Empowering communities through technology 🌟
