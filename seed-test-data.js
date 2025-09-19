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

// Check if we're in demo mode
const isDemoMode = () => {
  return !supabaseUrl || !supabaseKey ||
         supabaseUrl.includes('your-project-ref') ||
         supabaseKey.includes('your-anon-key') ||
         supabaseUrl.includes('demo') ||
         supabaseKey.includes('demo');
};

async function seedTestData() {
  try {
    console.log('🌱 Checking demo mode and seeding test data...\n');

    console.log('1. Demo mode status:', isDemoMode() ? 'DEMO MODE' : 'SUPABASE MODE');

    if (isDemoMode()) {
      console.log('⚠️  App is in demo mode - issues are stored in localStorage, not database');
      console.log('💡 To fix: Update your .env.local with valid Supabase credentials');
      return;
    }

    // Check if we have categories first
    console.log('\n2. Checking categories...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);

    if (catError) {
      console.error('❌ Error fetching categories:', catError);
    } else {
      console.log(`✅ Found ${categories.length} categories`);
    }

    // Check if we have departments
    console.log('\n3. Checking departments...');
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .limit(5);

    if (deptError) {
      console.error('❌ Error fetching departments:', deptError);
    } else {
      console.log(`✅ Found ${departments.length} departments`);
    }

    // Create a test issue
    if (categories.length > 0 && departments.length > 0) {
      console.log('\n4. Creating test issue...');

      const testIssue = {
        title: 'Test Issue for Update Testing',
        description: 'This is a test issue created to verify the update functionality works',
        category_id: categories[0].id,
        department_id: departments[0].id,
        user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        status: 'submitted',
        priority: 'medium',
        verification_status: 'pending',
        photo_urls: null,
        audio_url: null,
        latitude: 28.6139,
        longitude: 77.2090,
        vote_count: 0,
        assigned_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null
      };

      const { data: newIssue, error: insertError } = await supabase
        .from('issues')
        .insert(testIssue)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating test issue:', insertError);
      } else {
        console.log('✅ Test issue created successfully!');
        console.log('   Issue ID:', newIssue.id);
        console.log('   Title:', newIssue.title);
        console.log('   Status:', newIssue.status);
        console.log('\n💡 You can now test the update functionality with this issue');
      }
    } else {
      console.log('⚠️  Cannot create test issue - missing categories or departments');
      console.log('💡 Run the database seeding scripts first');
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedTestData();