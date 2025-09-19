// Database Diagnostic Script
// Run with: node database-diagnostic.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnoseDatabase() {
  console.log('🔍 Database Diagnostic Report\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('issues')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.log('❌ Connection test FAILED');
      console.log('   Error:', connectionError.message);
      console.log('   Code:', connectionError.code);
      console.log('   Details:', connectionError.details);
      console.log('   Hint:', connectionError.hint);

      if (connectionError.code === 'PGRST116') {
        console.log('\n💡 SOLUTION: The issues table does not exist.');
        console.log('   Run the database setup scripts in the supabase/ folder');
      }
      return;
    }
    console.log('✅ Connection test PASSED');

    // Test 2: Check issues table structure
    console.log('\n2️⃣ Checking issues table structure...');
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .limit(1);

    if (issuesError) {
      console.log('❌ Issues table query FAILED:', issuesError.message);
      return;
    }

    if (issues && issues.length > 0) {
      console.log('✅ Issues table has data');
      console.log('   Sample issue keys:', Object.keys(issues[0]));
    } else {
      console.log('⚠️ Issues table exists but is empty');
    }

    // Test 3: Test update permissions
    console.log('\n3️⃣ Testing update permissions...');
    const { data: updateTest, error: updateError } = await supabase
      .from('issues')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', issues[0]?.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Update test FAILED');
      console.log('   Error:', updateError.message);
      console.log('   Code:', updateError.code);

      if (updateError.code === '42501' || updateError.message.includes('permission')) {
        console.log('\n💡 SOLUTION: RLS policy issue');
        console.log('   Run the RLS fix scripts:');
        console.log('   - fix-issue-update-rls.sql');
        console.log('   - fix-profile-rls.sql');
      }
    } else {
      console.log('✅ Update permissions working');
    }

    // Test 4: Check related tables
    console.log('\n4️⃣ Checking related tables...');

    const tables = ['issue_updates', 'notifications', 'profiles', 'categories', 'departments'];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ ${table} table: MISSING or INACCESSIBLE`);
          console.log(`   Error: ${error.message}`);
        } else {
          console.log(`✅ ${table} table: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table} table: ERROR - ${err.message}`);
      }
    }

  } catch (err) {
    console.log('\n❌ Unexpected error during diagnosis:');
    console.log(err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🔧 If you see FAILED tests above, run the appropriate fix scripts');
  console.log('📁 Check the supabase/ folder for database setup scripts');
}

diagnoseDatabase();