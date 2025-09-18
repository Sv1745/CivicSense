'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, ListFilter, ListTodo, AlertTriangle, UserCheck, Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { IssueDataTable } from "./IssueDataTable";
import { useIssueChanges, useNotifications } from "@/hooks/useRealtime";
import { issueService, profileService } from "@/lib/database";
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
        const [issuesData, usersCount] = await Promise.all([
          issueService.getAllIssues(),
          profileService.getUserCount()
        ]);

        console.log(`🔎 AdminDashboard: initial load - received ${issuesData?.length ?? 0} issues and ${usersCount ?? 0} users`);
        if (issuesData && issuesData.length > 0) console.log('🔎 AdminDashboard: sample issue:', issuesData[0]);

        setAllIssues(issuesData || []);
        setTotalUsers(usersCount || 0);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Update all issues when real-time changes come in
  useEffect(() => {
    if (issues.length > 0) {
      setAllIssues(issues);
    }
  }, [issues]);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
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

      {/* Analytics Charts */}
      <AnalyticsCharts />

      {/* Issues Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Issues</CardTitle>
          <CardDescription>
            Real-time view of all reported issues with live updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IssueDataTable issues={allIssues} loading={issuesLoading} />
        </CardContent>
      </Card>
    </div>
  );
}