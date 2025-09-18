import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  console.log('🔄 OAuth Callback:', { code: !!code, error, origin: requestUrl.origin })

  if (error) {
    console.error('❌ OAuth Error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=${error}`)
  }

  if (code) {
    try {
      const cookieStore = await cookies()

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

      console.log('🔄 Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('❌ Session exchange error:', exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=session_exchange_failed`)
      }

      if (data.session) {
        console.log('✅ Session created successfully:', !!data.session.user)
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