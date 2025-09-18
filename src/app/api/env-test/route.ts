import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    environment: {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl?.substring(0, 20) + '...',
      keyPrefix: supabaseKey?.substring(0, 10) + '...',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL
    },
    timestamp: new Date().toISOString()
  })
}