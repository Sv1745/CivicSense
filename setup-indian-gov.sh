#!/bin/bash

# CivicSense Database Setup Script for Indian Government Data
# This script populates the Supabase database with comprehensive Indian government departments and categories

echo "🇮🇳 Setting up CivicSense with Indian Government Data..."
echo "=============================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run 'supabase init' first."
    exit 1
fi

echo "📋 Running database setup..."

# Run the initial schema
echo "🔧 Setting up database schema..."
supabase db reset --force

# Wait a moment for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run the Indian government data population
echo "🏛️ Populating Indian Government departments and categories..."
supabase db push

echo "📊 Running additional data setup..."
psql -h localhost -p 54322 -d postgres -U postgres -f sql/indian-government-data.sql

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🎯 Your CivicSense application is now configured with:"
echo "   • 40+ Indian Government Departments"
echo "   • 25+ Civic Issue Categories"
echo "   • Complete database schema with RLS policies"
echo "   • Optimized indexes for performance"
echo ""
echo "🚀 You can now run your application:"
echo "   npm run dev"
echo ""
echo "🔑 Admin Access:"
echo "   • Sign in with Google OAuth"
echo "   • First user gets admin role automatically"
echo "   • Access admin dashboard at /admin"
echo ""
echo "🇮🇳 Digital India - Empowering Citizens Through Technology"