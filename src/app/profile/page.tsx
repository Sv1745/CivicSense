'use client';

import { useState } from 'react';
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserProfileForm } from "@/components/forms/UserProfileForm";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { ProfileDebugHelper } from "@/components/debug/ProfileDebugHelper";
import { SimpleProfileTest } from "@/components/debug/SimpleProfileTest";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Loader2, User, BarChart3, Settings } from "lucide-react";

function ProfileDiagnostic() {
  const { user, loading, isOffline } = useAuth();

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {user ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
          <span>Profile Access Diagnostic</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Authentication Status:</span>
          <Badge variant={user ? "default" : "destructive"}>
            {user ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Connection Mode:</span>
          <Badge variant={isOffline ? "secondary" : "default"}>
            {isOffline ? "Offline/Demo" : "Online"}
          </Badge>
        </div>

        {user && (
          <>
            <div className="flex items-center justify-between">
              <span>User ID:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {user.id.substring(0, 8)}...
              </code>
            </div>

            <div className="flex items-center justify-between">
              <span>Email:</span>
              <span className="text-sm">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Role:</span>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </>
        )}

        {!user && !loading && (
          <div className="text-center text-red-600 text-sm mt-4">
            Profile not accessible. Check console for detailed error messages.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Your Profile</h1>
              <p className="text-muted-foreground">
                Manage your civic engagement, issues, and account settings.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </TabsTrigger>
                <TabsTrigger value="debug" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Debug Info</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <UserDashboard />
              </TabsContent>

              <TabsContent value="profile" className="max-w-2xl mx-auto">
                <div className="space-y-6">
                  <ProfileDiagnostic />
                  <UserProfileForm />
                </div>
              </TabsContent>

              <TabsContent value="debug" className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  <ProfileDiagnostic />
                  <SimpleProfileTest />
                  <ProfileDebugHelper />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}