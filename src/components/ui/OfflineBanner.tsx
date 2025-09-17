'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { offlineModeService } from '@/lib/offline-mode'

export function OfflineBanner() {
  const { isOffline } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    setIsVisible(isOffline && offlineModeService.showOfflineBanner())
  }, [isOffline])

  const handleRetry = async () => {
    setIsRetrying(true)
    
    // Wait a bit then reload the page to retry connection
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
      <div className="container mx-auto px-4 py-3">
        <Alert className="border-yellow-300 bg-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WifiOff className="w-5 h-5 text-orange-600" />
              <div>
                <AlertDescription className="text-orange-800 font-medium">
                  ⚠️ Connection Issue
                </AlertDescription>
                <AlertDescription className="text-orange-700 text-sm">
                  {offlineModeService.getOfflineMessage()}
                </AlertDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {isRetrying ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-orange-300 border-t-orange-600"></div>
                ) : (
                  <Wifi className="w-4 h-4 mr-1" />
                )}
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-orange-600 hover:bg-orange-100"
              >
                ×
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  )
}