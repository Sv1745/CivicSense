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

async function createTestAdmin() {
  try {
    console.log('👤 Creating test admin user...\n');

    // Test credentials
    const testEmail = 'admin@civicsense.com';
    const testPassword = 'test123456';

    console.log('1. Attempting to sign up test admin...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Admin'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ Admin user already exists, attempting sign in...');

        // Try to sign in instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });

        if (signInError) {
          console.error('❌ Sign in failed:', signInError.message);
          return;
        }

        console.log('✅ Signed in successfully!');
        console.log('   User ID:', signInData.user.id);
        console.log('   Email:', signInData.user.email);

        // Update profile to admin role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', signInData.user.id);

        if (updateError) {
          console.error('❌ Failed to update role to admin:', updateError.message);
        } else {
          console.log('✅ User role updated to admin');
        }

      } else {
        console.error('❌ Sign up failed:', signUpError.message);
        return;
      }
    } else {
      console.log('✅ Admin user created successfully!');
      console.log('   User ID:', signUpData.user?.id);
      console.log('   Email:', signUpData.user?.email);

      // Wait a moment for profile creation trigger
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update role to admin
      if (signUpData.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', signUpData.user.id);

        if (updateError) {
          console.error('❌ Failed to set admin role:', updateError.message);
        } else {
          console.log('✅ Admin role set successfully');
        }
      }
    }

    console.log('\n🎉 Test admin setup complete!');
    console.log('📧 Email: admin@civicsense.test');
    console.log('🔑 Password: test123456');
    console.log('👑 Role: admin');
    console.log('\n💡 Use these credentials to log in to the app and test issue updates');

  } catch (error) {
    console.error('❌ Test admin creation failed:', error);
  }
}

createTestAdmin();