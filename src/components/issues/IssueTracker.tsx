"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Eye,
  ThumbsUp,
  MessageCircle,
  Loader2,
  Edit,
  Save,
  X,
  Navigation,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { VoteButton } from '@/components/ui/VoteButton';
import { useLocationFilter } from '@/hooks/useLocation';
import { issueService, categoryService, departmentService } from '@/lib/database';
import type { Database } from '@/lib/database.types';

type Issue = Database['public']['Tables']['issues']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  department?: Database['public']['Tables']['departments']['Row'];
};

type Category = Database['public']['Tables']['categories']['Row'];
type Department = Database['public']['Tables']['departments']['Row'];

export function IssueTracker() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category_id: '',
    department_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Location filtering
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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let userIssues: Issue[];

        if (showNearbyOnly && location) {
          // Get nearby issues
          userIssues = await issueService.getNearbyIssues(
            location.latitude,
            location.longitude,
            radiusKm
          );
        } else {
          // Get all user issues
          userIssues = await issueService.getUserIssues(user.id);
        }

        const [allCategories, allDepartments] = await Promise.all([
          categoryService.getCategories(),
          departmentService.getDepartments()
        ]);

        setIssues(userIssues);
        setCategories(allCategories);
        setDepartments(allDepartments);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load issues. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast, showNearbyOnly, location, radiusKm]);

  // Filter issues based on location when location filtering is enabled
  const filteredIssues = issues.filter(issue => {
    if (!showNearbyOnly || !location || !issue.latitude || !issue.longitude) {
      return true;
    }
    return isWithinRadius(issue.latitude, issue.longitude);
  });

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'submitted': return 25;
      case 'under_review': return 50;
      case 'in_progress': return 75;
      case 'resolved': return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startEditing = (issue: Issue) => {
    setEditingIssue(issue.id);
    setEditForm({
      title: issue.title,
      description: issue.description,
      category_id: issue.category_id,
      department_id: issue.department_id || '',
      priority: issue.priority
    });
  };

  const cancelEditing = () => {
    setEditingIssue(null);
    setEditForm({
      title: '',
      description: '',
      category_id: '',
      department_id: '',
      priority: 'medium'
    });
  };

  const saveEdit = async () => {
    if (!editingIssue) return;

    setSavingEdit(true);
    try {
      const updatedIssue = await issueService.updateIssue(editingIssue, {
        title: editForm.title,
        description: editForm.description,
        category_id: editForm.category_id,
        department_id: editForm.department_id || undefined,
        priority: editForm.priority
      });

      if (updatedIssue) {
        // Update the issue in the local state
        setIssues(prev => prev.map(issue =>
          issue.id === editingIssue
            ? { ...issue, ...updatedIssue }
            : issue
        ));

        toast({
          title: 'Issue updated',
          description: 'Your issue has been successfully updated.',
        });
      }
    } catch (error) {
      console.error('❌ Error updating issue:', {
        error,
        editingIssue,
        editForm,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        variant: 'destructive',
        title: 'Failed to Update Issue',
        description: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setSavingEdit(false);
      setEditingIssue(null);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please log in to view your issues.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your issues...</p>
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No issues reported yet</h3>
          <p className="text-gray-600 mb-4">Start by reporting your first civic issue.</p>
          <Button onClick={() => window.location.href = '/report'}>
            Report an Issue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Location Filtering Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Issues</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="nearby-only"
                checked={showNearbyOnly}
                onCheckedChange={setShowNearbyOnly}
              />
              <Label htmlFor="nearby-only">Show only nearby issues</Label>
            </div>

            {showNearbyOnly && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestLocation}
                  disabled={location !== null}
                  className="flex items-center space-x-2"
                >
                  <Navigation className="h-4 w-4" />
                  <span>{location ? 'Location detected' : 'Get my location'}</span>
                </Button>

                {location && (
                  <div className="flex items-center space-x-2">
                    <Label>Radius:</Label>
                    <Slider
                      value={[radiusKm]}
                      onValueChange={(value) => setRadiusKm(value[0])}
                      max={50}
                      min={1}
                      step={1}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">{radiusKm}km</span>
                  </div>
                )}
              </>
            )}
          </div>

          {showNearbyOnly && !location && (
            <p className="text-sm text-amber-600">
              Enable location access to see issues near you.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Your Issue Reports ({filteredIssues.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>Location: {issue.latitude && issue.longitude ? `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}` : 'Not specified'}</span>
                        </span>
                        {location && issue.latitude && issue.longitude && (
                          <span className="text-blue-600">
                            {getDistanceText(issue.latitude, issue.longitude)}
                          </span>
                        )}
                        <span>Reported: {formatDate(issue.created_at)}</span>
                        <span className="capitalize">{issue.category?.name || 'General'}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <StatusBadge status={issue.status} />
                      <Badge variant={issue.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {issue.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-500">
                        {getStatusProgress(issue.status)}%
                      </span>
                    </div>
                    <Progress value={getStatusProgress(issue.status)} className="h-2" />
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        {getStatusIcon('submitted')}
                        <span>Submitted</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon('acknowledged')}
                        <span>Acknowledged</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon('in_progress')}
                        <span>In Progress</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon('resolved')}
                        <span>Resolved</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Notes - Removed for now as not in current schema */}
                  {/* Will be added back when issue_updates table is properly integrated */}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {/* Voting Button */}
                      <VoteButton
                        issueId={issue.id}
                        initialUpvotes={Math.max(0, (issue.vote_count || 0))}
                        initialDownvotes={0}
                        size="sm"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(issue)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                      >
                        {selectedIssue === issue.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      ID: {issue.id.substring(0, 8)}...
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedIssue === issue.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Department:</h4>
                        <p className="text-sm text-gray-600">{issue.department?.name || 'Not assigned'}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-1">Location:</h4>
                        <p className="text-sm text-gray-600">
                          {issue.latitude && issue.longitude 
                            ? `Coordinates: ${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}` 
                            : 'Location not specified'
                          }
                        </p>
                      </div>

                      {issue.photo_urls && issue.photo_urls.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Photos:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {issue.photo_urls.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Evidence ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Issue Dialog */}
      <Dialog open={!!editingIssue} onOpenChange={() => cancelEditing()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Issue title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={editForm.category_id}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Department</label>
              <Select
                value={editForm.department_id}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, department_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={editForm.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                  setEditForm(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}