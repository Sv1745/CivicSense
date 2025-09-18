import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OAuthTestPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: Environment variables
      results.envVars = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
      }

      // Test 2: Supabase client creation
      results.clientCreated = true

      // Test 3: Basic Supabase connection
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      results.sessionTest = {
        hasSession: !!sessionData?.session,
        error: sessionError?.message
      }

      // Test 4: OAuth URL generation
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      results.oauthTest = {
        url: oauthData?.url,
        error: oauthError?.message
      }

    } catch (error: any) {
      results.generalError = error.message
    }

    setTestResults(results)
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">OAuth Debug Test</h1>

      <button
        onClick={runTests}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6 disabled:opacity-50"
      >
        {loading ? 'Running Tests...' : 'Run OAuth Tests'}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Environment Info:</h2>
        <p>Origin: {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
        <p>Node Env: {process.env.NODE_ENV}</p>
      </div>
    </div>
  )
}