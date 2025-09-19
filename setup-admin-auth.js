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

// For admin operations, we need the service role key
// If you have it in your .env.local, add it as SUPABASE_SERVICE_ROLE_KEY
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : supabase;

async function setupTestAdmin() {
  try {
    console.log('🔧 Setting up test admin for immediate use...\n');

    const adminEmail = 'admin@civicsense.com';
    const adminPassword = 'test123456';

    // Method 1: Try to confirm the email using admin client
    console.log('1. Attempting to confirm admin email...');
    if (supabaseAdmin !== supabase) {
      try {
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (!listError && users) {
          const adminUser = users.users.find(u => u.email === adminEmail);
          if (adminUser) {
            console.log('✅ Found admin user, confirming email...');

            const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
              adminUser.id,
              { email_confirm: true }
            );

            if (confirmError) {
              console.error('❌ Email confirmation failed:', confirmError.message);
            } else {
              console.log('✅ Email confirmed successfully');
            }
          }
        }
      } catch (adminError) {
        console.log('⚠️  Admin operations not available, trying alternative method...');
      }
    }

    // Method 2: Try signing in (might work if email was auto-confirmed)
    console.log('\n2. Attempting sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);

      // Method 3: Create a new admin user with a different approach
      console.log('\n3. Creating new admin user with confirmed email...');

      // Try a different email that might be auto-confirmed
      const altEmail = 'testadmin@example.com';

      const { data: altSignUp, error: altError } = await supabase.auth.signUp({
        email: altEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: 'Test Admin'
          }
        }
      });

      if (altError) {
        console.error('❌ Alternative sign up failed:', altError.message);
        console.log('\n💡 Manual steps needed:');
        console.log('1. Go to Supabase Dashboard > Authentication > Users');
        console.log('2. Find the admin user and click "Confirm email"');
        console.log('3. Or enable "Enable email confirmations" in Auth settings');
        return;
      }

      console.log('✅ Alternative admin created:', altEmail);

      // Wait and try to sign in
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data: altSignIn, error: altSignInError } = await supabase.auth.signInWithPassword({
        email: altEmail,
        password: adminPassword
      });

      if (altSignInError) {
        console.error('❌ Alternative sign in failed:', altSignInError.message);
        return;
      }

      console.log('✅ Signed in with alternative admin');
      console.log('   User ID:', altSignIn.user.id);

      // Set admin role
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', altSignIn.user.id);

      if (roleError) {
        console.error('❌ Role update failed:', roleError.message);
      } else {
        console.log('✅ Admin role set');
      }

      console.log('\n🎉 Alternative admin ready!');
      console.log('📧 Email: testadmin@example.com');
      console.log('🔑 Password: test123456');

    } else {
      console.log('✅ Signed in successfully!');
      console.log('   User ID:', signInData.user.id);

      // Ensure admin role
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', signInData.user.id);

      if (roleError) {
        console.error('❌ Role update failed:', roleError.message);
      } else {
        console.log('✅ Admin role confirmed');
      }
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupTestAdmin();