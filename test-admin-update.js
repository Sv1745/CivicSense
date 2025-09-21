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

async function testAdminIssueUpdate() {
  try {
    console.log('🔐 Testing admin authentication and issue update...\n');

    // Sign in as admin
    console.log('1. Signing in as admin...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@CivicNetra.com',
      password: 'test123456'
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return;
    }

    console.log('✅ Signed in successfully as admin!');
    console.log('   User ID:', signInData.user.id);
    console.log('   Email:', signInData.user.email);

    // Check admin role
    console.log('\n2. Verifying admin role...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile check failed:', profileError.message);
    } else {
      console.log('✅ Admin role confirmed:', profile.role);
    }

    // Check if there are any issues
    console.log('\n3. Checking for existing issues...');
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('id, title, status, user_id')
      .limit(5);

    if (issuesError) {
      console.error('❌ Issues fetch failed:', issuesError.message);
      return;
    }

    console.log(`✅ Found ${issues.length} issues`);

    if (issues.length === 0) {
      console.log('⚠️  No issues found. Creating a test issue first...');

      // Create a test issue
      const testIssue = {
        title: 'Test Issue for Admin Update',
        description: 'This is a test issue to verify admin update functionality',
        category_id: '00000000-0000-0000-0000-000000000001',
        department_id: '00000000-0000-0000-0000-000000000001',
        user_id: signInData.user.id,
        status: 'submitted',
        priority: 'medium',
        verification_status: 'pending',
        photo_urls: null,
        audio_url: null,
        latitude: 28.6139,
        longitude: 77.2090,
        vote_count: 0,
        assigned_to: null
      };

      const { data: newIssue, error: createError } = await supabase
        .from('issues')
        .insert(testIssue)
        .select()
        .single();

      if (createError) {
        console.error('❌ Test issue creation failed:', createError.message);
        return;
      }

      console.log('✅ Test issue created:', newIssue.id);
      issues.push(newIssue);
    }

    // Test updating the first issue
    const testIssue = issues[0];
    console.log('\n4. Testing issue update...');
    console.log('   Issue ID:', testIssue.id);
    console.log('   Current status:', testIssue.status);

    const { data: updatedIssue, error: updateError } = await supabase
      .from('issues')
      .update({
        status: 'in_progress',
        assigned_to: signInData.user.id
      })
      .eq('id', testIssue.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      console.error('   Code:', updateError.code);
      console.error('   Details:', updateError.details);
    } else {
      console.log('✅ Update successful!');
      console.log('   New status:', updatedIssue.status);
      console.log('   Assigned to:', updatedIssue.assigned_to);
    }

    // Sign out
    console.log('\n5. Signing out...');
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminIssueUpdate();