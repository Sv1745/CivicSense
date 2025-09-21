import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 10) + '...')

  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    console.log('✅ Basic connection test:', { hasSession: !!data?.session, error: error?.message })

    // Test OAuth URL generation
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://CivicNetrasih.vercel.app/auth/callback'
      }
    })

    console.log('✅ OAuth URL generation:', {
      hasUrl: !!oauthData?.url,
      error: oauthError?.message,
      url: oauthData?.url?.substring(0, 50) + '...'
    })

  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

testSupabaseConnection()