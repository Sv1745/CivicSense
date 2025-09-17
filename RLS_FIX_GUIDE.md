# Fix for RLS Policy Error

## Problem
The signup process is failing with the error: "new row violates row-level security policy for table 'profiles'"

## Root Cause
The RLS policy in `supabase/schema.sql` was using `auth.role() = 'authenticated'` which doesn't work reliably. The `supabase-setup.sql` file has the correct policy.

## Solution

### Option 1: Apply Database Migration (Recommended)
Run this SQL in your Supabase SQL Editor:

```sql
-- Drop the problematic existing policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create the corrected policy (same as in supabase-setup.sql)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

### Option 2: Use the Correct Setup File
The `supabase-setup.sql` file has the correct RLS policies. Use this file instead of `supabase/schema.sql`.

### Code Changes Made
1. **Removed manual profile creation** from the signup process - the database trigger handles this automatically
2. **Fixed schema.sql** to use proper authentication checks  
3. **Kept fallback profile creation** in fetchUserProfile for edge cases

## How It Works Now
1. User signs up → Supabase creates auth.users record
2. Database trigger (`handle_new_user`) automatically creates profile record (bypasses RLS due to `security definer`)
3. User can immediately use the application

## Files Updated
- ✅ `src/contexts/AuthContext.tsx` - Removed manual profile creation
- ✅ `supabase/schema.sql` - Fixed RLS policy
- ✅ `migration-fix-profile-rls.sql` - Migration script created

## Verification
After applying the database fix, test the signup process. You should no longer see the RLS policy violation error.