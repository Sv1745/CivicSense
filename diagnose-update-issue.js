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

async function diagnoseUpdateIssue() {
  try {
    console.log('🔍 Diagnosing issue update problem...\n');

    // First, check if issues table exists and get a sample issue
    console.log('1. Checking issues table...');
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('id, title, status, user_id')
      .limit(5);

    if (issuesError) {
      console.error('❌ Error fetching issues:', issuesError);
      return;
    }

    console.log(`✅ Found ${issues.length} issues in database`);
    if (issues.length === 0) {
      console.log('⚠️  No issues found in database');
      return;
    }

    // Use the first issue for testing
    const testIssue = issues[0];
    console.log(`\n2. Testing update on issue: ${testIssue.id}`);
    console.log(`   Title: ${testIssue.title}`);
    console.log(`   Current status: ${testIssue.status}`);

    // Test the update operation
    console.log('\n3. Attempting update...');
    const { data: updatedIssue, error: updateError } = await supabase
      .from('issues')
      .update({ status: 'in_progress' })
      .eq('id', testIssue.id)
      .select(`
        *,
        category:categories(*),
        department:departments(*),
        user:profiles(*)
      `)
      .single();

    if (updateError) {
      console.error('❌ Update failed:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });

      // Check RLS policies
      console.log('\n4. Checking RLS policies...');
      const { data: policies, error: policyError } = await supabase
        .rpc('get_policies_for_table', { table_name: 'issues' });

      if (policyError) {
        console.log('   Could not check policies via RPC');
      } else {
        console.log('   Current policies:', policies);
      }

      return;
    }

    if (!updatedIssue) {
      console.error('❌ Update returned null - issue not found or no rows affected');
      return;
    }

    console.log('✅ Update successful!');
    console.log('   Updated issue:', {
      id: updatedIssue.id,
      title: updatedIssue.title,
      status: updatedIssue.status
    });

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

diagnoseUpdateIssue();