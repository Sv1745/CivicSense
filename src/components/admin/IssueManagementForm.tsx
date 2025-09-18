"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clock,
  MapPin,
  User,
  Building,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  MessageSquare,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { issueService, issueUpdateService, notificationService, profileService } from "@/lib/database";
import type { Database } from "@/lib/database.types";

type Issue = Database['public']['Tables']['issues']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  department?: Database['public']['Tables']['departments']['Row'];
  user?: Database['public']['Tables']['profiles']['Row'];
};

type Profile = Database['public']['Tables']['profiles']['Row'];

const updateSchema = z.object({
  status: z.enum(['submitted', 'acknowledged', 'in_progress', 'resolved', 'closed']),
  assigned_to: z.string().optional(),
  comment: z.string().optional(),
});

interface IssueManagementFormProps {
  issue: Issue;
  onUpdate?: (updatedIssue: Issue) => void;
}

export function IssueManagementForm({ issue, onUpdate }: IssueManagementFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [departmentUsers, setDepartmentUsers] = useState<Profile[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof updateSchema>>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: issue.status,
      assigned_to: issue.assigned_to || "unassigned",
      comment: "",
    },
  });

  const statusConfig = {
    submitted: { 
      label: "Submitted", 
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Clock 
    },
    acknowledged: { 
      label: "Acknowledged", 
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: CheckCircle 
    },
    in_progress: { 
      label: "In Progress", 
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Clock 
    },
    resolved: { 
      label: "Resolved", 
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle 
    },
    closed: { 
      label: "Closed", 
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: XCircle 
    },
  };

  const priorityConfig = {
    low: { label: "Low", color: "text-green-600", bg: "bg-green-100" },
    medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
    high: { label: "High", color: "text-orange-600", bg: "bg-orange-100" },
    urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-100" }
  };

  // Load department users when component mounts
  useEffect(() => {
    const loadDepartmentUsers = async () => {
      try {
        const users = await profileService.getAllUsers();
        // Filter users who can be assigned to this issue (admins and department heads)
        const assignableUsers = users.filter(u => 
          u.role === 'admin' || u.role === 'department_head'
        );
        setDepartmentUsers(assignableUsers);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadDepartmentUsers();
  }, []);

  const onSubmit = async (values: z.infer<typeof updateSchema>) => {
    if (!user) return;

    setIsUpdating(true);

    try {
      const oldStatus = issue.status;
      const newStatus = values.status;

      // Update the issue
      const updateData: Partial<Issue> = {
        status: values.status,
        assigned_to: values.assigned_to === "unassigned" ? null : values.assigned_to || null,
      };

      // Set resolved_at when status changes to resolved
      if (values.status === 'resolved' && oldStatus !== 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const updatedIssue = await issueService.updateIssue(issue.id, updateData);
      
      if (!updatedIssue) throw new Error('Failed to update issue');

      // Create update record
      await issueUpdateService.createUpdate({
        issue_id: issue.id,
        user_id: user.id,
        update_type: oldStatus !== newStatus ? 'status_change' : 'comment',
        old_value: oldStatus !== newStatus ? oldStatus : null,
        new_value: oldStatus !== newStatus ? newStatus : null,
        comment: values.comment || null,
      });

      // Send notification to issue reporter
      if (issue.user_id && issue.user_id !== user.id) {
        await notificationService.createNotification({
          user_id: issue.user_id,
          issue_id: issue.id,
          title: `Issue Update: ${issue.title}`,
          message: `Your issue has been updated. Status: ${statusConfig[values.status].label}`,
          type: values.status === 'resolved' ? 'success' : 'info',
        });
      }

      toast({
        title: "Issue updated successfully!",
        description: `Issue status changed to ${statusConfig[values.status].label}`,
      });

      // Clear comment field after successful update
      form.setValue('comment', '');
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(updatedIssue);
      }

    } catch (error) {
      console.error('Error updating issue:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusIcon = statusConfig[issue.status].icon;
  const priorityStyle = priorityConfig[issue.priority];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{issue.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Issue ID: {issue.id.slice(-8)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Badge className={statusConfig[issue.status].color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig[issue.status].label}
            </Badge>
            <Badge className={`${priorityStyle.bg} ${priorityStyle.color} border-0`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {priorityStyle.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Issue Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                {issue.description}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Reported by:</span>
                <span>{issue.user?.full_name || 'Unknown User'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Department:</span>
                <span>{issue.department?.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Category:</span>
                <span>{issue.category?.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span className="text-muted-foreground">
                  {issue.latitude && issue.longitude 
                    ? `${issue.latitude.toFixed(6)}, ${issue.longitude.toFixed(6)}`
                    : 'Location not available'
                  }
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Submitted:</span>
                <span>{new Date(issue.created_at).toLocaleString()}</span>
              </div>

              {issue.resolved_at && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Resolved:</span>
                  <span>{new Date(issue.resolved_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {issue.photo_urls && issue.photo_urls.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Photos</h4>
              <div className="grid grid-cols-2 gap-2">
                {issue.photo_urls.map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Issue photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Update Form */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Update Issue</h4>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([value, config]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <config.icon className="h-4 w-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "unassigned"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {departmentUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {user.full_name?.charAt(0)?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.full_name}</div>
                                  <div className="text-xs text-muted-foreground capitalize">
                                    {user.role.replace('_', ' ')}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add an internal comment about this update"
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal comments are only visible to department staff
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Update Issue
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}