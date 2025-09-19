// Test user permissions and roles
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUserPermissions() {
  console.log('🔍 Testing User Permissions and Roles\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Check authentication status
    console.log('\n1️⃣ Checking authentication status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('❌ User not authenticated');
      console.log('   Error:', authError?.message);
      console.log('💡 SOLUTION: User needs to be logged in to update issues');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('   User ID:', user.id);

    // Test 2: Check user profile and role
    console.log('\n2️⃣ Checking user profile and role...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Profile query failed:', profileError.message);
      console.log('💡 SOLUTION: User profile may not exist in profiles table');
      return;
    }

    console.log('✅ User profile found:');
    console.log('   Name:', profile.full_name || 'Not set');
    console.log('   Role:', profile.role || 'Not set');

    // Test 3: Check if user has issues they can update
    console.log('\n3️⃣ Checking user issues...');
    const { data: userIssues, error: issuesError } = await supabase
      .from('issues')
      .select('id, title, status, user_id')
      .eq('user_id', user.id)
      .limit(3);

    if (issuesError) {
      console.log('❌ User issues query failed:', issuesError.message);
      console.log('   Code:', issuesError.code);
      return;
    }

    console.log(`✅ Found ${userIssues?.length || 0} issues for this user`);
    if (userIssues && userIssues.length > 0) {
      console.log('   Sample issue:', userIssues[0].title);
    }

    // Test 4: Try to update one of the user's issues
    console.log('\n4️⃣ Testing issue update...');
    if (userIssues && userIssues.length > 0) {
      const testIssue = userIssues[0];
      const { data: updateResult, error: updateError } = await supabase
        .from('issues')
        .update({
          updated_at: new Date().toISOString(),
          status: testIssue.status // Keep same status, just update timestamp
        })
        .eq('id', testIssue.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ Update test FAILED');
        console.log('   Error:', updateError.message);
        console.log('   Code:', updateError.code);
        console.log('   Details:', updateError.details);

        if (updateError.code === '42501' || updateError.message.includes('permission')) {
          console.log('\n💡 SOLUTION: RLS policy issue - run the comprehensive RLS fix');
        }
      } else {
        console.log('✅ Update test PASSED');
        console.log('   Issue updated successfully');
      }
    } else {
      console.log('⚠️ No user issues found to test update');
      console.log('💡 Try creating an issue first, then test updating it');
    }

  } catch (err) {
    console.log('\n❌ Unexpected error:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Summary:');
  console.log('- If authentication fails: User needs to log in');
  console.log('- If profile query fails: User profile missing');
  console.log('- If update fails: RLS policy issue - run comprehensive-rls-fix.sql');
}

testUserPermissions();