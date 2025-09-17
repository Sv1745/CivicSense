'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Upload } from 'lucide-react'
import { storageService } from '@/lib/database'

interface StorageStatus {
  connected: boolean
  buckets: string[]
  error: string | null
  lastChecked: Date | null
}

export function StorageDiagnostics() {
  const [status, setStatus] = useState<StorageStatus>({
    connected: false,
    buckets: [],
    error: null,
    lastChecked: null
  })
  const [testing, setTesting] = useState(false)
  const [uploadTesting, setUploadTesting] = useState(false)

  const runStorageTest = async () => {
    setTesting(true)
    
    try {
      const result = await storageService.testStorageConnection()
      setStatus({
        connected: result.success,
        buckets: result.buckets,
        error: result.error || null,
        lastChecked: new Date()
      })
    } catch (error) {
      setStatus({
        connected: false,
        buckets: [],
        error: (error as Error).message,
        lastChecked: new Date()
      })
    }
    
    setTesting(false)
  }

  const testFileUpload = async () => {
    setUploadTesting(true)
    
    try {
      // Create a test file (1x1 pixel PNG)
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const response = await fetch(testImageData)
      const blob = await response.blob()
      const testFile = new File([blob], 'test.png', { type: 'image/png' })
      
      // Test upload with mock user ID
      const testUrl = await storageService.uploadIssuePhoto(testFile, 'test-user-123')
      
      if (testUrl) {
        alert('✅ Upload test successful! Storage is working properly.')
      } else {
        alert('❌ Upload test failed - no URL returned')
      }
    } catch (error) {
      alert(`❌ Upload test failed: ${(error as Error).message}`)
    }
    
    setUploadTesting(false)
  }

  useEffect(() => {
    runStorageTest()
  }, [])

  const getStatusIcon = (connected: boolean, error: string | null) => {
    if (connected) return <CheckCircle className="w-5 h-5 text-green-500" />
    if (error) return <XCircle className="w-5 h-5 text-red-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusBadge = (text: string, isSuccess: boolean) => {
    return (
      <Badge variant={isSuccess ? "default" : "destructive"} className={isSuccess ? "bg-green-100 text-green-800" : ""}>
        {text}
      </Badge>
    )
  }

  const requiredBuckets = ['issue-photos', 'issue-audio', 'avatars']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Storage Diagnostics
          </span>
          <div className="flex space-x-2">
            <Button 
              onClick={runStorageTest} 
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
            <Button 
              onClick={testFileUpload} 
              disabled={uploadTesting || !status.connected}
              size="sm"
              variant="outline"
            >
              {uploadTesting ? (
                <Upload className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Test Upload
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              {getStatusIcon(status.connected, status.error)}
              <span className="ml-2">Connection Status</span>
            </h4>
            <div className="space-y-2">
              {getStatusBadge(
                status.connected ? "Connected" : "Disconnected",
                status.connected
              )}
              {status.lastChecked && (
                <div className="text-xs text-gray-500">
                  Last checked: {status.lastChecked.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Storage Buckets</h4>
            <div className="space-y-2">
              {requiredBuckets.map(bucket => {
                const exists = status.buckets.includes(bucket)
                return (
                  <div key={bucket} className="flex justify-between items-center">
                    <span className="text-sm font-mono">{bucket}</span>
                    {getStatusBadge(exists ? "✓" : "✗", exists)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {status.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="font-semibold text-red-800 mb-1">Storage Error</h4>
            <p className="text-sm text-red-700">{status.error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="font-semibold text-blue-800 mb-2">Fix Upload Issues</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Run the storage setup SQL script in your Supabase dashboard</li>
            <li>Check that all three storage buckets exist: issue-photos, issue-audio, avatars</li>
            <li>Verify storage policies allow authenticated users to upload</li>
            <li>Ensure your Supabase project has storage enabled</li>
            <li>Check file size limits (5MB for photos, 10MB for audio)</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h4 className="font-semibold text-yellow-800 mb-2">Setup Instructions</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Go to your Supabase dashboard → Storage</li>
            <li>Run the setup-storage.sql script from your project root</li>
            <li>Verify the buckets are created with correct policies</li>
            <li>Test file upload using the "Test Upload" button above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}