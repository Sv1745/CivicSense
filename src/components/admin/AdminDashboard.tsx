'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, ListFilter, ListTodo, AlertTriangle, UserCheck, Bell, RefreshCw, Map, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { IssueDataTable } from "./IssueDataTable";
import { AdminMapView } from "./AdminMapView";
import { useIssueChanges, useNotifications } from "@/hooks/useRealtime";
import { issueService, profileService, isDemoMode } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { user } = useAuth();
  const { issues, metrics, loading: issuesLoading } = useIssueChanges();
  const { notifications, unreadCount } = useNotifications();
  const [allIssues, setAllIssues] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🔎 AdminDashboard: loading initial data...');
        
        // Test issues fetch specifically
        console.log('🔎 AdminDashboard: Fetching issues...');
        const issuesData = await issueService.getAllIssues();
        console.log('🔎 AdminDashboard: Issues data received:', issuesData);
        console.log('🔎 AdminDashboard: Issues data type:', typeof issuesData);
        console.log('🔎 AdminDashboard: Issues data length:', issuesData?.length ?? 'undefined');
        
        // Test users count
        console.log('🔎 AdminDashboard: Fetching users count...');
        const usersCount = await profileService.getUserCount();
        console.log('🔎 AdminDashboard: Users count received:', usersCount);

        const [issuesData2, usersCount2] = await Promise.all([
          issueService.getAllIssues(),
          profileService.getUserCount()
        ]);

        console.log(`🔎 AdminDashboard: initial load - received ${issuesData2?.length ?? 0} issues and ${usersCount2 ?? 0} users`);
        if (issuesData2 && issuesData2.length > 0) console.log('🔎 AdminDashboard: sample issue:', issuesData2[0]);

        setAllIssues(issuesData2 || []);
        setTotalUsers(usersCount2 || 0);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Update debug info when user changes
  useEffect(() => {
    const updateUserInfo = async () => {
      if (user) {
        console.log('🔎 AdminDashboard: User object:', user);
        
        // The user object from useAuth should already have the role from the profile
        const userRole = user.role || 'unknown';
      }
    };
    
    updateUserInfo();
  }, [user]);

  // Update debug info on mount
  useEffect(() => {
    // No longer needed - debug info removed
  }, []);

  // Update all issues when real-time changes come in (only for updates, not initial load)
  useEffect(() => {
    // Only update if we already have issues loaded AND real-time hook has data
    if (allIssues.length > 0 && issues.length > 0) {
      console.log('🔄 AdminDashboard: Updating issues from real-time changes');
      setAllIssues(issues);
    }
  }, [issues, allIssues.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [issuesData, usersCount] = await Promise.all([
        issueService.getAllIssues(),
        profileService.getUserCount()
      ]);
      
      setAllIssues(issuesData || []);
      setTotalUsers(usersCount || 0);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const [demoBanner, setDemoBanner] = useState<string>("");
  useEffect(() => {
    setDemoBanner(isDemoMode() ? "DEMO MODE: Showing sample data only" : "SUPABASE MODE: Showing live database data");
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className={`mb-4 px-4 py-2 rounded text-sm font-semibold ${isDemoMode() ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>{demoBanner}</div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of all civic issues and system activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}/>
            Refresh
          </Button>
          <Button variant="outline">
            <ListFilter className="mr-2 h-4 w-4"/>
            Filters
          </Button>
          <Button>
            Export Data
          </Button>
        </div>
      </div>

      {/* Real-time metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Reports</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {issuesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics.submitted}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting acknowledgement</p>
            {!issuesLoading && metrics.submitted > 0 && (
              <Badge variant="destructive" className="mt-2">
                Action Required
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {issuesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics.in_progress + metrics.acknowledged}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {metrics.acknowledged} acknowledged, {metrics.in_progress} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {issuesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics.resolved + metrics.closed}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {metrics.resolved} resolved, {metrics.closed} closed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="mt-2">
                <Bell className="mr-1 h-3 w-3" />
                {unreadCount} notifications
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Priority Alerts */}
      {!issuesLoading && allIssues.some(issue => issue.priority === 'urgent') && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgent Issues Requiring Immediate Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allIssues
                .filter(issue => issue.priority === 'urgent' && issue.status !== 'resolved' && issue.status !== 'closed')
                .slice(0, 3)
                .map(issue => (
                  <div key={issue.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium text-sm">{issue.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {issue.category?.name} • {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="destructive">URGENT</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center space-x-2">
            <ListTodo className="h-4 w-4" />
            <span>Issues Table</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map className="h-4 w-4" />
            <span>Map View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Charts */}
          <AnalyticsCharts />
        </TabsContent>

        <TabsContent value="table" className="space-y-6">
          {/* Issues Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Issues Management</CardTitle>
              <CardDescription>
                Real-time view of all reported issues with live updates and status management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IssueDataTable issues={allIssues} loading={issuesLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          {/* Admin Map View */}
          <AdminMapView 
            issues={allIssues}
            showMunicipalityBounds={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}