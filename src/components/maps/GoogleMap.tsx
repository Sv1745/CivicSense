"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    info?: string;
    icon?: string;
  }>;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  className?: string;
}

export function GoogleMap({
  center = { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
  zoom = 12,
  markers = [],
  onMapClick,
  className = "w-full h-96"
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        setIsLoaded(true);

        if (mapRef.current) {
          const googleMap = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          setMap(googleMap);

          if (onMapClick) {
            googleMap.addListener('click', onMapClick);
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [center.lat, center.lng, zoom, onMapClick]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: markerData.icon
      });

      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.info
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [map, markers]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`${className} bg-gray-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center p-4">
          <p className="text-gray-600">Google Maps API key not configured</p>
          <p className="text-sm text-gray-500 mt-2">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '300px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}