// Test RLS policies after reset
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAfterReset() {
  console.log('🧪 Testing RLS Policies After Reset\n');
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
      return;
    }
    console.log('✅ Connection test PASSED');

    // Test 2: Check if we can see any issues (this tests SELECT policy)
    console.log('\n2️⃣ Testing SELECT policy...');
    const { data: issues, error: selectError } = await supabase
      .from('issues')
      .select('id, title, status')
      .limit(3);

    if (selectError) {
      console.log('❌ SELECT policy test FAILED');
      console.log('   Error:', selectError.message);
      console.log('   Code:', selectError.code);
      console.log('💡 This means RLS policies are blocking access');
    } else {
      console.log('✅ SELECT policy test PASSED');
      console.log(`   Found ${issues?.length || 0} issues visible to current user`);
    }

    // Test 3: Try to create a test issue (this tests INSERT policy)
    console.log('\n3️⃣ Testing INSERT policy...');
    const testIssue = {
      title: 'Test Issue - Please Delete',
      description: 'This is a test issue created to verify RLS policies',
      category_id: '00000000-0000-0000-0000-000000000001', // You'll need to use a real category ID
      department_id: '00000000-0000-0000-0000-000000000001', // You'll need to use a real department ID
      user_id: '00000000-0000-0000-0000-000000000001', // This should be the current user's ID
      priority: 'medium',
      status: 'submitted',
      location: { lat: 0, lng: 0 },
      address: 'Test Address'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('issues')
      .insert(testIssue)
      .select()
      .single();

    if (insertError) {
      console.log('❌ INSERT policy test FAILED');
      console.log('   Error:', insertError.message);
      console.log('   Code:', insertError.code);
      console.log('💡 This is expected if user is not authenticated or IDs are invalid');
    } else {
      console.log('✅ INSERT policy test PASSED');
      console.log('   Test issue created with ID:', insertResult.id);

      // Clean up: delete the test issue
      await supabase.from('issues').delete().eq('id', insertResult.id);
      console.log('   Test issue cleaned up');
    }

  } catch (err) {
    console.log('\n❌ Unexpected error during testing:');
    console.log(err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Next Steps:');
  console.log('1. If SELECT test failed: RLS policies are too restrictive');
  console.log('2. If INSERT test failed: Check authentication or use valid IDs');
  console.log('3. Try the actual app update functionality');
  console.log('4. Check browser console for detailed error logs');
}

testAfterReset();