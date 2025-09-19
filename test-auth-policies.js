const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.startsWith('NEXT_PUBLIC_SUPABASE')) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthAndPolicies() {
  try {
    console.log('🔐 Testing authentication and RLS policies...\n');

    // Test 1: Check current auth state
    console.log('1. Checking authentication state...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      console.log('💡 User might not be logged in');
    } else if (!user) {
      console.log('❌ No authenticated user');
      console.log('💡 User needs to log in first');
    } else {
      console.log('✅ User authenticated:', user.email);
      console.log('   User ID:', user.id);

      // Test 2: Check user profile and role
      console.log('\n2. Checking user profile and role...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message);
      } else {
        console.log('✅ Profile found:');
        console.log('   Name:', profile.full_name || 'No name');
        console.log('   Role:', profile.role || 'No role');
        console.log('   Is Admin:', profile.role === 'admin' ? 'YES' : 'NO');
      }

      // Test 3: Try to update an issue (if any exist)
      console.log('\n3. Testing issue update with current user...');
      const { data: issues, error: issuesError } = await supabase
        .from('issues')
        .select('id, title, status')
        .limit(1);

      if (issuesError) {
        console.error('❌ Could not fetch issues:', issuesError.message);
      } else if (issues.length === 0) {
        console.log('⚠️  No issues found to test update');
      } else {
        const testIssue = issues[0];
        console.log('   Found issue:', testIssue.title);
        console.log('   Current status:', testIssue.status);

        // Try to update
        const { data: updatedIssue, error: updateError } = await supabase
          .from('issues')
          .update({ status: 'in_progress' })
          .eq('id', testIssue.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Update failed:', updateError.message);
          console.error('   Code:', updateError.code);
        } else {
          console.log('✅ Update succeeded!');
          console.log('   New status:', updatedIssue.status);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuthAndPolicies();