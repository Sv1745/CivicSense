'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { supabase, testSupabaseConnection, checkSupabaseHealth } from '@/lib/supabase'

interface ConnectionStatus {
  url: string
  key: string
  connected: boolean
  error: string | null
  lastChecked: Date | null
  authStatus: string
  dbStatus: string
}

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || 'Not configured',
    connected: false,
    error: null,
    lastChecked: null,
    authStatus: 'Unknown',
    dbStatus: 'Unknown'
  })
  const [testing, setTesting] = useState(false)

  const runConnectionTest = async () => {
    setTesting(true)
    
    try {
      // Test basic connection
      const isConnected = await testSupabaseConnection()
      
      // Test auth status
      const { data: authData, error: authError } = await supabase.auth.getSession()
      const authStatus = authError ? `Error: ${authError.message}` : 
                        authData.session ? 'Authenticated' : 'Not authenticated'
      
      // Test database health
      const healthCheck = await checkSupabaseHealth()
      const dbStatus = healthCheck.success ? 'Connected' : `Error: ${healthCheck.error}`
      
      setStatus({
        ...status,
        connected: isConnected,
        error: isConnected ? null : 'Connection failed',
        lastChecked: new Date(),
        authStatus,
        dbStatus
      })
    } catch (error) {
      setStatus({
        ...status,
        connected: false,
        error: (error as Error).message,
        lastChecked: new Date(),
        authStatus: 'Error',
        dbStatus: 'Error'
      })
    }
    
    setTesting(false)
  }

  useEffect(() => {
    runConnectionTest()
  }, [])

  const getStatusIcon = (connected: boolean, error: string | null) => {
    if (connected) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (error) return <XCircle className="w-5 h-5 text-red-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusBadge = (statusText: string) => {
    if (statusText.includes('Error') || statusText === 'Unknown') {
      return <Badge variant="destructive">{statusText}</Badge>
    }
    if (statusText === 'Connected' || statusText === 'Authenticated') {
      return <Badge variant="default" className="bg-green-100 text-green-800">{statusText}</Badge>
    }
    return <Badge variant="secondary">{statusText}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            {getStatusIcon(status.connected, status.error)}
            <span className="ml-2">Supabase Connection Diagnostics</span>
          </span>
          <Button 
            onClick={runConnectionTest} 
            disabled={testing}
            size="sm"
            variant="outline"
          >
            {testing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Test Connection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Configuration</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">URL:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                  {status.url}
                </code>
              </div>
              <div>
                <span className="font-medium">API Key:</span>
                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                  {status.key}
                </code>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Database:</span>
                {getStatusBadge(status.dbStatus)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Authentication:</span>
                {getStatusBadge(status.authStatus)}
              </div>
              {status.lastChecked && (
                <div className="text-xs text-gray-500">
                  Last checked: {status.lastChecked.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="font-semibold text-red-800 mb-1">Connection Error</h4>
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="font-semibold text-blue-800 mb-2">Troubleshooting Steps</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Verify your Supabase project URL and API key in .env.local</li>
            <li>Check if your Supabase project is active (not paused)</li>
            <li>Ensure your internet connection is stable</li>
            <li>Check if your firewall/antivirus is blocking the connection</li>
            <li>Verify your database schema is properly set up</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}