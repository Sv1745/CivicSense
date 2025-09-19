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

async function checkRLSPolicies() {
  try {
    console.log('🔍 Checking current RLS policies on issues table...\n');

    // Try to get policies using a direct query
    const { data: policies, error } = await supabase
      .rpc('get_policies_for_table', { table_name: 'issues' });

    if (error) {
      console.log('❌ Could not get policies via RPC:', error.message);
      console.log('💡 This might mean no policies exist or RPC function is not available');
    } else {
      console.log('📋 Current policies on issues table:');
      if (policies && policies.length > 0) {
        policies.forEach((policy, index) => {
          console.log(`${index + 1}. ${policy.name || 'Unnamed policy'}`);
          console.log(`   Command: ${policy.cmd || 'ALL'}`);
          console.log(`   Roles: ${policy.roles || 'public'}`);
          if (policy.definition) {
            console.log(`   Definition: ${policy.definition}`);
          }
          console.log('');
        });
      } else {
        console.log('   No policies found');
      }
    }

    // Test if we can insert with service role key (if available)
    console.log('\n🔑 Testing insert permissions...');

    // First, try to see what happens with a simple select
    const { data: testSelect, error: selectError } = await supabase
      .from('issues')
      .select('id')
      .limit(1);

    if (selectError) {
      console.log('❌ SELECT failed:', selectError.message);
    } else {
      console.log('✅ SELECT works');
    }

    // Try to insert (this should fail due to RLS)
    const testIssue = {
      title: 'Test Issue',
      description: 'Test description',
      category_id: '00000000-0000-0000-0000-000000000001',
      department_id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000000',
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

    const { data: testInsert, error: insertError } = await supabase
      .from('issues')
      .insert(testIssue);

    if (insertError) {
      console.log('❌ INSERT failed (expected due to RLS):', insertError.message);
      console.log('💡 This confirms RLS policies are active');
    } else {
      console.log('✅ INSERT succeeded (RLS not blocking)');
    }

  } catch (error) {
    console.error('❌ Policy check failed:', error);
  }
}

checkRLSPolicies();