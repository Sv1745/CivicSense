'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polygon } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Building, Users, BarChart3, Settings, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { IssueManagementForm } from '@/components/admin/IssueManagementForm';
import { issueService, departmentService } from '@/lib/database';
import type { Database } from '@/lib/database.types';

type Issue = Database['public']['Tables']['issues']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  department?: Database['public']['Tables']['departments']['Row'];
  user?: Database['public']['Tables']['profiles']['Row'];
};

type Department = Database['public']['Tables']['departments']['Row'];

interface AdminMapViewProps {
  issues?: Issue[];
  showMunicipalityBounds?: boolean;
  height?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

// Default to Delhi area for admin view
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
};

// Status colors for admin markers (more distinct)
const getMarkerColor = (status: string) => {
  switch (status) {
    case 'submitted': return '#3B82F6'; // Blue
    case 'acknowledged': return '#F59E0B'; // Amber
    case 'in_progress': return '#8B5CF6'; // Purple
    case 'resolved': return '#10B981'; // Emerald
    case 'closed': return '#6B7280'; // Gray
    default: return '#EF4444'; // Red
  }
};

// Priority affects marker size
const getPrioritySize = (priority: string) => {
  switch (priority) {
    case 'urgent': return 45;
    case 'high': return 40;
    case 'medium': return 35;
    case 'low': return 30;
    default: return 35;
  }
};

// Sample municipality boundaries (in real app, fetch from database)
const municipalityBounds = {
  'New Delhi': [
    { lat: 28.6448, lng: 77.2167 },
    { lat: 28.6448, lng: 77.2500 },
    { lat: 28.5900, lng: 77.2500 },
    { lat: 28.5900, lng: 77.2167 },
  ],
  'Central Delhi': [
    { lat: 28.6700, lng: 77.2000 },
    { lat: 28.6700, lng: 77.2400 },
    { lat: 28.6200, lng: 77.2400 },
    { lat: 28.6200, lng: 77.2000 },
  ],
};

export function AdminMapView({ 
  issues: propIssues, 
  showMunicipalityBounds = true,
  height = '600px'
}: AdminMapViewProps) {
  const [issues, setIssues] = useState<Issue[]>(propIssues || []);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(!propIssues);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('all');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showBounds, setShowBounds] = useState(showMunicipalityBounds);

  // Load issues and departments
  useEffect(() => {
    const loadData = async () => {
      if (!propIssues) {
        setLoading(true);
        try {
          const [loadedIssues, loadedDepartments] = await Promise.all([
            issueService.getAllIssues(),
            departmentService.getDepartments()
          ]);
          
          const issuesWithLocation = loadedIssues.filter(
            issue => issue.latitude && issue.longitude
          );
          
          setIssues(issuesWithLocation);
          setDepartments(loadedDepartments);
        } catch (error) {
          console.error('Error loading admin map data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const loadedDepartments = await departmentService.getDepartments();
          setDepartments(loadedDepartments);
        } catch (error) {
          console.error('Error loading departments:', error);
        }
      }
    };

    loadData();
  }, [propIssues]);

  // Filter issues based on admin selections
  const filteredIssues = issues.filter(issue => {
    if (selectedDepartment !== 'all' && issue.department_id !== selectedDepartment) {
      return false;
    }
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) {
      return false;
    }
    // Municipality filtering would need geofencing logic
    return true;
  });

  // Calculate statistics
  const statistics = {
    total: filteredIssues.length,
    submitted: filteredIssues.filter(i => i.status === 'submitted').length,
    acknowledged: filteredIssues.filter(i => i.status === 'acknowledged').length,
    inProgress: filteredIssues.filter(i => i.status === 'in_progress').length,
    resolved: filteredIssues.filter(i => i.status === 'resolved').length,
    closed: filteredIssues.filter(i => i.status === 'closed').length,
    urgent: filteredIssues.filter(i => i.priority === 'urgent').length,
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleIssueUpdate = (updatedIssue: Issue) => {
    setIssues(prev => prev.map(issue => 
      issue.id === updatedIssue.id ? updatedIssue : issue
    ));
    setSelectedIssue(updatedIssue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Admin Controls and Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {statistics.urgent} urgent priority
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {statistics.submitted + statistics.acknowledged}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Need attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statistics.inProgress}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Being worked on
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.resolved + statistics.closed}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Completed issues
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Administrative Map View</span>
            <Badge variant="secondary">{filteredIssues.length} issues</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBounds(!showBounds)}
              >
                {showBounds ? 'Hide' : 'Show'} Boundaries
              </Button>
            </div>
          </div>

          {filteredIssues.length === 0 && (
            <p className="text-gray-500 text-sm">
              No issues found matching the selected criteria.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <LoadScript 
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            loadingElement={
              <div style={{ height }} className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <GoogleMap
              mapContainerStyle={{ ...mapContainerStyle, height }}
              center={defaultCenter}
              zoom={11}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={mapOptions}
            >
              {/* Municipality Boundaries */}
              {showBounds && Object.entries(municipalityBounds).map(([name, bounds]) => (
                <Polygon
                  key={name}
                  paths={bounds}
                  options={{
                    fillColor: '#3B82F6',
                    fillOpacity: 0.1,
                    strokeColor: '#3B82F6',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              ))}

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
                      <svg width="${getPrioritySize(issue.priority)}" height="${getPrioritySize(issue.priority)}" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="25" cy="25" r="20" fill="${getMarkerColor(issue.status)}" stroke="white" stroke-width="4"/>
                        <text x="25" y="32" text-anchor="middle" fill="white" font-size="18" font-weight="bold">!</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(getPrioritySize(issue.priority), getPrioritySize(issue.priority)),
                    anchor: new google.maps.Point(getPrioritySize(issue.priority) / 2, getPrioritySize(issue.priority) / 2)
                  }}
                />
              ))}

              {/* Admin Info Window with Management */}
              {selectedIssue && (
                <InfoWindow
                  position={{
                    lat: selectedIssue.latitude!,
                    lng: selectedIssue.longitude!
                  }}
                  onCloseClick={() => setSelectedIssue(null)}
                >
                  <div className="max-w-md p-2">
                    <div className="space-y-3">
                      {/* Header */}
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{selectedIssue.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {selectedIssue.description}
                        </p>
                      </div>

                      {/* Status, Priority, and Department */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={selectedIssue.status} />
                        <Badge variant={selectedIssue.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {selectedIssue.priority}
                        </Badge>
                        {selectedIssue.department && (
                          <Badge variant="outline">
                            {selectedIssue.department.name}
                          </Badge>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Category: {selectedIssue.category?.name || 'General'}</div>
                        <div>Reported: {formatDate(selectedIssue.created_at)}</div>
                        {selectedIssue.user && (
                          <div>Reporter: {selectedIssue.user.full_name || selectedIssue.user.email}</div>
                        )}
                        <div>
                          Location: {selectedIssue.latitude?.toFixed(4)}, {selectedIssue.longitude?.toFixed(4)}
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center justify-between">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="flex items-center space-x-1">
                              <Settings className="h-3 w-3" />
                              <span>Manage Issue</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Manage Issue: {selectedIssue.title}</DialogTitle>
                            </DialogHeader>
                            <IssueManagementForm 
                              issue={selectedIssue}
                              onUpdate={handleIssueUpdate}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
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
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium mb-2">Issue Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Submitted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span>Acknowledged</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span>Resolved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span>Closed</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">Marker Size:</span> Larger markers indicate higher priority issues
            </div>
            {showBounds && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Blue Boundaries:</span> Administrative municipality areas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}