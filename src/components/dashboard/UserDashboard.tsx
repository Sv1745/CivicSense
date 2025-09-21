'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  List, 
  Map, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Navigation,
  Eye,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocationFilter } from '@/hooks/useLocation';
import { IssueTracker } from '@/components/issues/IssueTracker';
import { MapView } from '@/components/maps/MapView';
import { VoteButton } from '@/components/ui/VoteButton';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { issueService, voteService } from '@/lib/database';
import { duplicateDetectionService } from '@/lib/duplicate-detection';
import type { Database } from '@/lib/database.types';

type Issue = Database['public']['Tables']['issues']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  department?: Database['public']['Tables']['departments']['Row'];
  user?: { full_name: string; email: string } | null;
};

export function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location, requestLocation, getDistanceText } = useLocationFilter();
  
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [votingEnabled, setVotingEnabled] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const [allIssuesData, userIssuesData] = await Promise.all([
          issueService.getAllIssues(),
          issueService.getUserIssues(user.id)
        ]);

        setAllIssues(allIssuesData);
        setUserIssues(userIssuesData);

        // Load nearby issues if location is available
        if (location) {
          const nearbyData = await issueService.getNearbyIssues(
            location.latitude,
            location.longitude,
            5 // 5km radius
          );
          setNearbyIssues(nearbyData);
          setVotingEnabled(true);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, location, toast]);

  // Calculate statistics
  const stats = {
    totalIssues: allIssues.length,
    userReported: userIssues.length,
    nearbyIssues: nearbyIssues.length,
    userResolved: userIssues.filter(issue => issue.status === 'resolved').length,
    canVoteOn: nearbyIssues.length + userIssues.length, // Issues user can vote on
    urgentNearby: nearbyIssues.filter(issue => issue.priority === 'urgent').length
  };

  // Get issues user can vote on (nearby + similar to their reports)
  const getVotableIssues = async (): Promise<Issue[]> => {
    if (!user) return [];

    const votableIssues: Issue[] = [];
    
    // Add nearby issues
    votableIssues.push(...nearbyIssues);
    
    // Add issues similar to user's reports
    for (const userIssue of userIssues) {
      const result = await duplicateDetectionService.checkForDuplicates(
        userIssue.title,
        userIssue.description,
        userIssue.category_id,
        userIssue.latitude || undefined,
        userIssue.longitude || undefined
      );
      
      for (const similar of result.similarIssues) {
        if (similar.score > 0.5 && !votableIssues.find(issue => issue.id === similar.issue.id)) {
          votableIssues.push(similar.issue);
        }
      }
    }

    return votableIssues;
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Track your issues, vote on community problems, and stay updated.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!location && (
            <Button
              variant="outline"
              onClick={requestLocation}
              className="flex items-center space-x-2"
            >
              <Navigation className="h-4 w-4" />
              <span>Enable Location</span>
            </Button>
          )}
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Report Issue</span>
          </Button>
        </div>
      </div>

      {/* Location Status */}
      {!location && (
        <Alert className="border-amber-200 bg-amber-50">
          <Navigation className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Enable location access</strong> to vote on nearby issues and see location-based recommendations.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Reports</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userReported}</div>
            <p className="text-xs text-muted-foreground">
              {stats.userResolved} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nearby Issues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nearbyIssues}</div>
            <p className="text-xs text-muted-foreground">
              {stats.urgentNearby} urgent
            </p>
            {!location && (
              <p className="text-xs text-amber-600 mt-1">Enable location to see</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Can Vote On</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.canVoteOn}</div>
            <p className="text-xs text-muted-foreground">
              Issues in your area
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Total issues reported
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="my-issues" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>My Issues</span>
          </TabsTrigger>
          <TabsTrigger value="nearby" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Nearby</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map className="h-4 w-4" />
            <span>Map View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userIssues.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <StatusBadge status={issue.status} />
                    <div className="flex-1">
                      <h4 className="font-medium">{issue.title}</h4>
                      <p className="text-sm text-gray-600">
                        Reported {formatDate(issue.created_at)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {userIssues.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No issues reported yet. Start by reporting a civic issue in your area.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Nearby Issues Preview */}
          {location && nearbyIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues Near You</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyIssues.slice(0, 3).map((issue) => (
                    <div key={issue.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <StatusBadge status={issue.status} />
                      <div className="flex-1">
                        <h4 className="font-medium">{issue.title}</h4>
                        <p className="text-sm text-gray-600">
                          {issue.latitude && issue.longitude && (
                            <span>{getDistanceText(issue.latitude, issue.longitude)} away</span>
                          )}
                        </p>
                      </div>
                      <VoteButton 
                        issueId={issue.id}
                        size="sm"
                        enforceAreaRestrictions={true}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-issues" className="space-y-6">
          <IssueTracker />
        </TabsContent>

        <TabsContent value="nearby" className="space-y-6">
          {location ? (
            <Card>
              <CardHeader>
                <CardTitle>Issues Near Your Location</CardTitle>
                <p className="text-sm text-gray-600">
                  You can vote on these issues because they are in your area (within 5km).
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyIssues.map((issue) => (
                    <Card key={issue.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <span>{formatDate(issue.created_at)}</span>
                              <span>{getDistanceText(issue.latitude!, issue.longitude!)} away</span>
                              <span>Category: {issue.category?.name || 'General'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <StatusBadge status={issue.status} />
                            <Badge variant={issue.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {issue.priority}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <VoteButton 
                            issueId={issue.id}
                            enforceAreaRestrictions={true}
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open(`/issues/${issue.id}`, '_blank');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {nearbyIssues.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No issues found in your area. Great news!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
                <p className="text-gray-600 mb-4">
                  Enable location access to see issues near you and vote on local problems.
                </p>
                <Button onClick={requestLocation}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Enable Location Access
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <MapView 
            issues={location ? nearbyIssues : allIssues}
            showUserLocation={true}
          />
        </TabsContent>
      </Tabs>

      {/* Voting Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Voting Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>You can vote on issues that are:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              {duplicateDetectionService.getVotingRulesExplanation().map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              This system prevents spam voting and ensures community members vote on issues that affect them directly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}