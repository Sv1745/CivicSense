import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  console.log('🔄 OAuth Callback:', { 
    code: !!code, 
    error, 
    origin: requestUrl.origin,
    url: requestUrl.toString()
  })

  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔧 Environment check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl?.substring(0, 20) + '...',
    keyPrefix: supabaseKey?.substring(0, 10) + '...'
  })

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=missing_env_vars`)
  }

  if (code) {
    try {
      const cookieStore = await cookies()

      // Log all available cookies for debugging
      const allCookies = cookieStore.getAll()
      console.log('🍪 Available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))

      // Specifically check for PKCE-related cookies
      const pkceCookies = ['sb-ccdjkyqbnhsrwkmwizrq-auth-token', 'supabase-auth-token', 'sb-auth-token']
      pkceCookies.forEach(cookieName => {
        const cookie = cookieStore.get(cookieName)
        if (cookie) {
          console.log(`🍪 Found cookie: ${cookieName} = ${cookie.value?.substring(0, 20)}...`)
        }
      })

      console.log('🔧 Creating Supabase server client...')
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )

      // Test the Supabase client connection
      console.log('🔍 Testing Supabase client...')
      try {
        const { data: healthData, error: healthError } = await supabase.auth.getSession()
        console.log('🔍 Health check result:', {
          hasSession: !!healthData?.session,
          healthError: healthError?.message
        })
      } catch (healthTestError) {
        console.error('❌ Supabase client health test failed:', healthTestError)
      }

      console.log('🔄 Exchanging code for session...', { 
        codeLength: code.length,
        codeValue: code.substring(0, 20) + '...',
        codeIsEmpty: !code || code.trim() === ''
      })
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      console.log('🔍 Exchange result:', {
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        error: exchangeError
      })

      if (exchangeError) {
        console.error('❌ Session exchange error details:', {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name,
          code: exchangeError.code,
          details: exchangeError
        })

        // Log additional context
        console.error('❌ Additional context:', {
          codeProvided: !!code,
          codeLength: code?.length,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
          origin: requestUrl.origin,
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer')
        })

        return NextResponse.redirect(`${requestUrl.origin}/auth?error=session_exchange_failed&details=${encodeURIComponent(exchangeError.message)}`)
      }

      if (data.session) {
        console.log('✅ Session created successfully:', {
          userId: data.session.user?.id,
          email: data.session.user?.email,
          expiresAt: data.session.expires_at
        })
      } else {
        console.log('⚠️ No session created')
      }

    } catch (err) {
      console.error('❌ Callback processing error:', err)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=callback_processing_failed`)
    }
  }

  // URL to redirect to after sign in process completes
  console.log('🔄 Redirecting to:', `${requestUrl.origin}`)
  return NextResponse.redirect(`${requestUrl.origin}`)
}