'use client';

import { useState, useEffect, useCallback } from 'react';
import { locationService } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
}

export function useUserLocation() {
  const { toast } = useToast();
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    permission: null
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const location: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setState({
        location,
        loading: false,
        error: null,
        permission: 'granted'
      });

      toast({
        title: 'Location Found',
        description: 'Your location has been detected for nearby issues.',
      });

    } catch (error: any) {
      let errorMessage = 'Unable to get your location';
      let permission: 'granted' | 'denied' | 'prompt' | null = null;

      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location access denied. Please enable location permissions.';
        permission = 'denied';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information is unavailable.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out.';
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        permission
      }));

      toast({
        title: 'Location Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [toast]);

  const clearLocation = useCallback(() => {
    setState({
      location: null,
      loading: false,
      error: null,
      permission: null
    });
  }, []);

  // Check permission status on mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setState(prev => ({ ...prev, permission: result.state as any }));

        result.addEventListener('change', () => {
          setState(prev => ({ ...prev, permission: result.state as any }));
        });
      });
    }
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation
  };
}

// Hook for filtering issues by location
export function useLocationFilter() {
  const { location, requestLocation } = useUserLocation();
  const [radiusKm, setRadiusKm] = useState(10);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);

  const isWithinRadius = useCallback((issueLat: number, issueLng: number): boolean => {
    if (!location || !showNearbyOnly) return true;

    const distance = locationService.calculateDistance(
      location.latitude,
      location.longitude,
      issueLat,
      issueLng
    );

    return distance <= radiusKm;
  }, [location, radiusKm, showNearbyOnly]);

  const getDistanceText = useCallback((issueLat: number, issueLng: number): string | null => {
    if (!location) return null;

    const distance = locationService.calculateDistance(
      location.latitude,
      location.longitude,
      issueLat,
      issueLng
    );

    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else {
      return `${distance.toFixed(1)}km away`;
    }
  }, [location]);

  return {
    location,
    radiusKm,
    setRadiusKm,
    showNearbyOnly,
    setShowNearbyOnly,
    requestLocation,
    isWithinRadius,
    getDistanceText
  };
}