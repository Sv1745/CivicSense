"use client";

import { useState, useEffect } from 'react';
import { GoogleMap } from '@/components/maps/GoogleMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Filter, 
  Layers,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { IssueReport } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { useToast } from '@/hooks/use-toast';

interface IssueMapProps {
  showOnlyUserIssues?: boolean;
  userId?: string;
}

export function IssuesMap({ showOnlyUserIssues = false, userId }: IssueMapProps) {
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const { toast } = useToast();

  useEffect(() => {
    let q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));

    if (showOnlyUserIssues && userId) {
      // Filter query would be applied here for user-specific issues
      // q = query(collection(db, 'reports'), where('citizenId', '==', userId), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IssueReport[];
      
      setIssues(issuesData);
      setLoading(false);

      // Update map center to first issue if available
      if (issuesData.length > 0 && issuesData[0].location.coordinates) {
        setMapCenter({
          lat: issuesData[0].location.coordinates.lat,
          lng: issuesData[0].location.coordinates.lng
        });
      }
    }, (error) => {
      console.error('Error fetching issues:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load issues. Please try again.',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showOnlyUserIssues, userId, toast]);

  const filteredIssues = issues.filter(issue => {
    if (filterStatus === 'all') return true;
    return issue.status === filterStatus;
  });

  const mapMarkers = filteredIssues.map(issue => ({
    position: {
      lat: issue.location.coordinates?.lat || 0,
      lng: issue.location.coordinates?.lng || 0
    },
    title: issue.title,
    info: `
      <div class="p-2 max-w-xs">
        <h3 class="font-semibold text-sm">${issue.title}</h3>
        <p class="text-xs text-gray-600 mt-1">${issue.description.substring(0, 100)}${issue.description.length > 100 ? '...' : ''}</p>
        <div class="mt-2 flex items-center space-x-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            ${issue.status.replace('_', ' ')}
          </span>
          <span class="text-xs text-gray-500">${issue.priority}</span>
        </div>
      </div>
    `,
    icon: getMarkerIcon(issue.status, issue.priority).url
  }));

  function getMarkerIcon(status: string, priority: string) {
    let color = '#3B82F6'; // Default blue
    
    switch (status) {
      case 'submitted':
        color = '#EF4444'; // Red
        break;
      case 'acknowledged':
        color = '#F59E0B'; // Amber
        break;
      case 'in_progress':
        color = '#3B82F6'; // Blue
        break;
      case 'resolved':
        color = '#10B981'; // Green
        break;
    }

    if (priority === 'urgent') {
      color = '#DC2626'; // Dark red for urgent
    }

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>`
      )}`,
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 24)
    };
  }

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    // Handle map click events if needed
    console.log('Map clicked at:', event.latLng?.toJSON());
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Issues Map</span>
              <Badge variant="secondary">{filteredIssues.length} issues</Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'submitted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('submitted')}
              >
                New
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('in_progress')}
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('resolved')}
              >
                Resolved
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <GoogleMap
                center={mapCenter}
                zoom={11}
                markers={mapMarkers}
                onMapClick={handleMapClick}
                className="w-full h-96 rounded-lg border"
              />
            </div>

            {/* Issue List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <h3 className="font-semibold flex items-center space-x-2">
                <Layers className="h-4 w-4" />
                <span>Recent Issues</span>
              </h3>
              
              {filteredIssues.slice(0, 10).map(issue => (
                <Card 
                  key={issue.id} 
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedIssue?.id === issue.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedIssue(issue)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm truncate flex-1">
                          {issue.title}
                        </h4>
                        <StatusBadge status={issue.status} />
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{issue.location.city}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(issue.createdAt)}</span>
                        </span>
                      </div>
                      
                      {issue.votes > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Eye className="h-3 w-3" />
                          <span>{issue.votes} votes</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredIssues.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No issues found for the selected filter.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">New Issues</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Acknowledged</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm">Resolved</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}