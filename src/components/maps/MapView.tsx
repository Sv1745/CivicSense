'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Filter, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { VoteButton } from '@/components/ui/VoteButton';
import { useLocationFilter } from '@/hooks/useLocation';
import { issueService } from '@/lib/database';
import type { Database } from '@/lib/database.types';

type Issue = Database['public']['Tables']['issues']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  department?: Database['public']['Tables']['departments']['Row'];
  user?: { full_name: string; email: string } | null;
};

interface MapViewProps {
  issues?: Issue[];
  showUserLocation?: boolean;
  height?: string;
  onIssueSelect?: (issue: Issue) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 28.6139, // Delhi coordinates as default
  lng: 77.2090
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

// Status colors for map markers
const getMarkerColor = (status: string) => {
  switch (status) {
    case 'submitted': return '#3B82F6'; // Blue
    case 'acknowledged': return '#F59E0B'; // Yellow
    case 'in_progress': return '#8B5CF6'; // Purple
    case 'resolved': return '#10B981'; // Green
    case 'closed': return '#6B7280'; // Gray
    default: return '#EF4444'; // Red
  }
};

// Priority colors for marker styling
const getPrioritySize = (priority: string) => {
  switch (priority) {
    case 'urgent': return 40;
    case 'high': return 35;
    case 'medium': return 30;
    case 'low': return 25;
    default: return 30;
  }
};

export function MapView({ 
  issues: propIssues, 
  showUserLocation = true, 
  height = '500px',
  onIssueSelect 
}: MapViewProps) {
  const [issues, setIssues] = useState<Issue[]>(propIssues || []);
  const [loading, setLoading] = useState(!propIssues);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);

  const {
    location,
    radiusKm,
    setRadiusKm,
    showNearbyOnly,
    setShowNearbyOnly,
    requestLocation,
    isWithinRadius,
    getDistanceText
  } = useLocationFilter();

  // Load issues if not provided as props
  useEffect(() => {
    if (!propIssues) {
      const loadIssues = async () => {
        setLoading(true);
        try {
          let loadedIssues: Issue[];
          
          loadedIssues = await issueService.getAllIssues();
          
          // Filter nearby issues if location is available
          if (showNearbyOnly && location) {
            loadedIssues = loadedIssues.filter(issue => 
              issue.latitude && 
              issue.longitude && 
              isWithinRadius(issue.latitude, issue.longitude)
            );
          }
          
          // Filter out issues without location data
          const issuesWithLocation = loadedIssues.filter(
            issue => issue.latitude && issue.longitude
          );
          
          setIssues(issuesWithLocation);
        } catch (error) {
          console.error('Error loading issues for map:', error);
        } finally {
          setLoading(false);
        }
      };

      loadIssues();
    }
  }, [propIssues, showNearbyOnly, location, radiusKm]);

  // Filter issues based on location
  const filteredIssues = issues.filter(issue => {
    if (!issue.latitude || !issue.longitude) return false;
    if (!showNearbyOnly || !location) return true;
    return isWithinRadius(issue.latitude, issue.longitude);
  });

  // Update map center when user location changes
  useEffect(() => {
    if (location && map) {
      map.panTo({ lat: location.latitude, lng: location.longitude });
      
      // Add user location marker
      if (userMarker) {
        userMarker.setMap(null);
      }
      
      const newUserMarker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
              <circle cx="15" cy="15" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(30, 30),
          anchor: new google.maps.Point(15, 15)
        }
      });
      
      setUserMarker(newUserMarker);
    }
  }, [location, map]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    if (userMarker) {
      userMarker.setMap(null);
      setUserMarker(null);
    }
  }, [userMarker]);

  const handleMarkerClick = (issue: Issue) => {
    setSelectedIssue(issue);
    if (onIssueSelect) {
      onIssueSelect(issue);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Issues Map</span>
            <Badge variant="secondary">{filteredIssues.length} issues</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            {showUserLocation && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestLocation}
                disabled={location !== null}
                className="flex items-center space-x-2"
              >
                <Navigation className="h-4 w-4" />
                <span>{location ? 'Location detected' : 'Find my location'}</span>
              </Button>
            )}

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm">Showing:</span>
              <Badge variant={showNearbyOnly ? 'default' : 'outline'}>
                {showNearbyOnly ? `Within ${radiusKm}km` : 'All issues'}
              </Badge>
            </div>
          </div>

          {filteredIssues.length === 0 && (
            <p className="text-gray-500 text-sm">
              No issues found {showNearbyOnly ? 'in your area' : 'with location data'}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here' ? (
            <div style={{ height }} className="flex flex-col items-center justify-center bg-gray-50 text-gray-600">
              <MapPin className="h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Map View Unavailable</h3>
              <p className="text-center text-sm max-w-md">
                Google Maps API key is not configured. The map view requires a valid API key to display locations.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
              </p>
            </div>
          ) : (
            <LoadScript 
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              loadingElement={
                <div style={{ height }} className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }
              onError={(error) => {
                console.error('Google Maps loading error:', error);
              }}
            >
            <GoogleMap
              mapContainerStyle={{ ...mapContainerStyle, height }}
              center={location ? { lat: location.latitude, lng: location.longitude } : defaultCenter}
              zoom={location ? 13 : 10}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={mapOptions}
            >
              {/* Issue Markers */}
              {filteredIssues.map((issue) => (
                <Marker
                  key={issue.id}
                  position={{
                    lat: issue.latitude!,
                    lng: issue.longitude!
                  }}
                  onClick={() => handleMarkerClick(issue)}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="${getPrioritySize(issue.priority)}" height="${getPrioritySize(issue.priority)}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="15" fill="${getMarkerColor(issue.status)}" stroke="white" stroke-width="3"/>
                        <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(getPrioritySize(issue.priority), getPrioritySize(issue.priority)),
                    anchor: new google.maps.Point(getPrioritySize(issue.priority) / 2, getPrioritySize(issue.priority) / 2)
                  }}
                />
              ))}

              {/* Info Window for Selected Issue */}
              {selectedIssue && (
                <InfoWindow
                  position={{
                    lat: selectedIssue.latitude!,
                    lng: selectedIssue.longitude!
                  }}
                  onCloseClick={() => setSelectedIssue(null)}
                >
                  <div className="max-w-sm p-2">
                    <div className="space-y-3">
                      {/* Header */}
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{selectedIssue.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {selectedIssue.description}
                        </p>
                      </div>

                      {/* Status and Priority */}
                      <div className="flex items-center gap-2">
                        <StatusBadge status={selectedIssue.status} />
                        <Badge variant={selectedIssue.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {selectedIssue.priority}
                        </Badge>
                      </div>

                      {/* Category and Date */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Category: {selectedIssue.category?.name || 'General'}</div>
                        <div>Reported: {formatDate(selectedIssue.created_at)}</div>
                        {location && (
                          <div className="text-blue-600">
                            {getDistanceText(selectedIssue.latitude!, selectedIssue.longitude!)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <VoteButton
                          issueId={selectedIssue.id}
                          size="sm"
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to issue detail page
                            window.open(`/issues/${selectedIssue.id}`, '_blank');
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Details</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Submitted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Acknowledged</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Resolved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>Closed</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Marker size indicates priority: Larger = Higher priority
          </div>
        </CardContent>
      </Card>
    </div>
  );
}