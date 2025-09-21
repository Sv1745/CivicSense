@echo off
echo 🇮🇳 Setting up CivicNetra with Indian Government Data...
echo ==============================================

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Supabase CLI not found. Please install it first:
    echo    npm install -g supabase
    pause
    exit /b 1
)

REM Check if we're in a Supabase project
if not exist "supabase\config.toml" (
    echo ❌ Not in a Supabase project directory. Please run 'supabase init' first.
    pause
    exit /b 1
)

echo 📋 Running database setup...

REM Run the initial schema
echo 🔧 Setting up database schema...
supabase db reset --force

REM Wait a moment for the database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak >nul

REM Run the database push
echo 🏛️ Populating Indian Government departments and categories...
supabase db push

echo 📊 Running additional data setup...
psql -h localhost -p 54322 -d postgres -U postgres -f sql\indian-government-data.sql

echo.
echo ✅ Database setup complete!
echo.
echo 🎯 Your CivicNetra application is now configured with:
echo    • 40+ Indian Government Departments
echo    • 25+ Civic Issue Categories  
echo    • Complete database schema with RLS policies
echo    • Optimized indexes for performance
echo.
echo 🚀 You can now run your application:
echo    npm run dev
echo.
echo 🔑 Admin Access:
echo    • Sign in with Google OAuth
echo    • First user gets admin role automatically
echo    • Access admin dashboard at /admin
echo.
echo 🇮🇳 Digital India - Empowering Citizens Through Technology
echo.
pause