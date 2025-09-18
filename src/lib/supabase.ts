import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  throw new Error('Missing Supabase URL. Please check your .env.local file.')
}

if (!supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  throw new Error('Missing Supabase Anon Key. Please check your .env.local file.')
}

console.log('🔗 Supabase URL:', supabaseUrl)
console.log('🔑 Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...')

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Let client detect session in URL so PKCE code_verifier is used client-side
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'x-my-custom-header': 'civic-sense-app'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Connection test function
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

// Auth helpers
export const auth = supabase.auth

// Storage helper
export const storage = supabase.storage

// Database helper
export const db = supabase.from

// Real-time helper
export const realtime = supabase.channel

// Health check function
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    return { success: !error, error: error?.message }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export default supabase