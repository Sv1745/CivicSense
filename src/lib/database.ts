import type { Database } from './database.types';
import { supabase } from './supabase';
import { demoService, isDemoMode } from './demo-service';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Issue = Tables['issues']['Row'];
type Category = Tables['categories']['Row'];
type Department = Tables['departments']['Row'];
type IssueUpdate = Tables['issue_updates']['Row'];
type Notification = Tables['notifications']['Row'];

// Initialize demo mode if needed
if (typeof window !== 'undefined' && isDemoMode()) {
  demoService.init();
}

// Export demo mode checker for UI banner
export { isDemoMode };
// Profile operations
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    if (isDemoMode()) {
      return await demoService.getProfile(userId);
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },

  async updateProfile(userId: string, updates: Tables['profiles']['Update']): Promise<Profile | null> {
    if (isDemoMode()) {
      return await demoService.updateProfile(userId, updates);
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    return data;
  },

  async getAllUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
  },

  async getUserCount(): Promise<number> {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching user count:', error);
      return 0;
    }
    
    return count || 0;
  },

  async getAdminUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'department_head'])
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
    
    return data || [];
  }
};

// Category operations
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    if (isDemoMode()) {
      return await demoService.getCategories();
    }
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        // If table doesn't exist, fallback to demo data
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('📋 Categories table not found, falling back to demo data');
          return await demoService.getCategories();
        }
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Categories fetch failed, using demo data:', err);
      return await demoService.getCategories();
    }
  },

  async createCategory(category: Tables['categories']['Insert']): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    return data;
  }
};

// Department operations
export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    if (isDemoMode()) {
      return await demoService.getDepartments();
    }
    
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching departments:', error);
        // If table doesn't exist, fallback to demo data
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('🏢 Departments table not found, falling back to demo data');
          return await demoService.getDepartments();
        }
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Departments fetch failed, using demo data:', err);
      return await demoService.getDepartments();
    }
  },

  async getDepartmentsByCity(city: string, state: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .or(`city.eq.${city},city.eq.Various Cities`)
      .or(`state.eq.${state},state.eq.Multi-State`)
      .order('name');
    
    if (error) {
      console.error('Error fetching departments by city:', error);
      return [];
    }
    
    return data || [];
  },

  async createDepartment(department: Tables['departments']['Insert']): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating department:', error);
      throw error;
    }
    
    return data;
  }
};

// Issue operations
export const issueService = {
  async createIssue(issue: Tables['issues']['Insert']): Promise<Issue | null> {
    if (isDemoMode()) {
      return await demoService.createIssue(issue);
    }
    
    try {
      console.log('🔄 Attempting to create issue in Supabase...');
      console.log('📋 Issue data:', JSON.stringify(issue, null, 2));
      
      // Try to create issue in Supabase first
      const { data, error } = await supabase
        .from('issues')
        .insert(issue)
        .select('*')
        .single();
        
      if (error) {
        console.error('Supabase error:', JSON.stringify(error, null, 2));
        console.log('📋 Database not ready, using demo data instead');
        return await demoService.createIssue(issue);
      }
      
      console.log('✅ Issue created successfully in Supabase');
      return data as Issue;
        
    } catch (err) {
      console.error('Issue creation failed:', err);
      console.log('📋 Falling back to demo data due to error');
      return await demoService.createIssue(issue);
    }
  },

  async getUserIssues(userId: string): Promise<Issue[]> {
    if (isDemoMode()) {
      const allIssues = await demoService.getAllIssues();
      return allIssues.filter(issue => issue.user_id === userId);
    }
    
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          category:categories(*),
          department:departments(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user issues:', error);
        // If table doesn't exist, fallback to demo data
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log('📋 Issues table not found, falling back to demo data');
          const allIssues = await demoService.getAllIssues();
          return allIssues.filter(issue => issue.user_id === userId);
        }
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('User issues fetch failed, using demo data:', err);
      const allIssues = await demoService.getAllIssues();
      return allIssues.filter(issue => issue.user_id === userId);
    }
  },

  async getAllIssues(): Promise<Issue[]> {
    if (isDemoMode()) {
      const demoIssues = await demoService.getAllIssues();
      console.log('🧪 issueService.getAllIssues: running in DEMO mode, returning', demoIssues.length, 'issues');
      if (demoIssues.length > 0) console.log('🧪 Sample demo issue:', JSON.stringify(demoIssues[0]));
      return demoIssues;
    }
    
    try {
      // Get issues with category and department joins
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select(`
          *,
          categories(*),
          departments(*)
        `)
        .order('created_at', { ascending: false });
      
      if (issuesError) {
        console.error('Error fetching issues:', JSON.stringify(issuesError, null, 2));
        return [];
      }
      
      if (!issuesData || issuesData.length === 0) {
        console.log('✅ No issues found in database');
        return [];
      }
      
      // Manually fetch user profiles for each issue
      const issuesWithUsers = await Promise.all(
        issuesData.map(async (issue) => {
          try {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', issue.user_id)
              .single();
            
            if (userError) {
              console.warn(`Could not fetch user for issue ${issue.id}:`, userError.message);
              return {
                ...issue,
                user: null
              };
            }
            
            return {
              ...issue,
              user: userData
            };
          } catch (err) {
            console.warn(`Error fetching user for issue ${issue.id}:`, err);
            return {
              ...issue,
              user: null
            };
          }
        })
      );
      
      console.log('✅ issueService.getAllIssues: fetched', issuesWithUsers.length, 'issues from Supabase with user data');
      if (issuesWithUsers.length > 0) console.log('✅ Sample issue with user:', JSON.stringify(issuesWithUsers[0]));
      return issuesWithUsers;
    } catch (err) {
      console.error('Issues fetch failed, using demo data:', err);
      const demoIssues = await demoService.getAllIssues();
      console.log('🧪 issueService.getAllIssues: exception occurred, demo fallback used, returning', demoIssues.length, 'issues');
      return demoIssues;
    }
  },

  async updateIssue(issueId: string, updates: Partial<Issue>): Promise<Issue | null> {
    if (isDemoMode()) {
      return await demoService.updateIssue(issueId, updates);
    }
    
    try {
      console.log('🔄 Attempting to update issue in Supabase...', { issueId, updates });
      
      // First, try a simple update without joins
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', issueId)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Error updating issue:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          issueId,
          updates
        });
        
        // Check for specific error types and fallback to demo
        if (error.code === 'PGRST116' || 
            error.code === 'PGRST200' ||
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('relationship')) {
          console.log('📋 Database schema issue, falling back to demo data');
          return await demoService.updateIssue(issueId, updates);
        }
        
        // For other errors, still try demo fallback
        console.log('📋 Update failed, trying demo fallback');
        return await demoService.updateIssue(issueId, updates);
      }
      
      console.log('✅ Issue updated successfully in Supabase:', data);
      
      // Try to fetch related data separately if the basic update succeeded
      try {
        const { data: enrichedData } = await supabase
          .from('issues')
          .select(`
            *,
            category:categories(*),
            department:departments(*)
          `)
          .eq('id', issueId)
          .single();
        
        return enrichedData || data;
      } catch (enrichError) {
        console.log('⚠️ Could not fetch related data, returning basic issue data');
        return data;
      }
      
    } catch (err) {
      console.error('❌ Issue update failed:', {
        error: err,
        issueId,
        updates,
        errorMessage: err instanceof Error ? err.message : 'Unknown error'
      });
      
      // Always fallback to demo for any error
      console.log('📋 Falling back to demo data due to error');
      return await demoService.updateIssue(issueId, updates);
    }
  },

  async getIssueById(issueId: string): Promise<Issue | null> {
    if (isDemoMode()) {
      // Get the issue from demo data
      const allIssues = await demoService.getAllIssues();
      return allIssues.find(issue => issue.id === issueId) || null;
    }

    try {
      // Use simple select to avoid foreign key issues
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', issueId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching issue:', error);
        // Check for table not found or foreign key issues
        if (error.code === 'PGRST116' || 
            error.code === 'PGRST200' ||
            error.message?.includes('relation') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('relationship')) {
          console.log('📋 Database schema issue, falling back to demo data');
          const allIssues = await demoService.getAllIssues();
          return allIssues.find(issue => issue.id === issueId) || null;
        }
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('❌ Issue fetch failed:', err);
      // Fallback to demo data
      const allIssues = await demoService.getAllIssues();
      return allIssues.find(issue => issue.id === issueId) || null;
    }
  },

  // Delegate to locationService for nearby issues
  async getNearbyIssues(lat: number, lng: number, radiusKm: number = 5): Promise<Issue[]> {
    return locationService.getNearbyIssues(lat, lng, radiusKm);
  }
};

// Issue update operations
export const issueUpdateService = {
  async createUpdate(update: Tables['issue_updates']['Insert']): Promise<IssueUpdate | null> {
    const { data, error } = await supabase
      .from('issue_updates')
      .insert(update)
      .select('*, user:profiles(full_name)')
      .single();
    
    if (error) {
      console.error('Error creating issue update:', error);
      throw error;
    }
    
    return data;
  },

  async getIssueUpdates(issueId: string): Promise<IssueUpdate[]> {
    const { data, error } = await supabase
      .from('issue_updates')
      .select('*, user:profiles(full_name)')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching issue updates:', error);
      return [];
    }
    
    return data || [];
  }
};

// Notification operations
export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async createNotification(notification: Tables['notifications']['Insert']): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      
      if (error) {
        console.error('⚠️ Error creating notification (non-critical):', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        
        // Don't throw for RLS policy errors or table issues - notifications are not critical
        if (error.code === '42501' || // RLS policy violation
            error.code === 'PGRST116' || // Table not found
            error.message?.includes('policy') ||
            error.message?.includes('relation') ||
            error.message?.includes('does not exist')) {
          console.log('📋 Notification creation failed due to permissions/schema - continuing without notification');
          return null;
        }
        
        // For other errors, still don't throw - just log and return null
        console.log('📋 Notification creation failed - continuing without notification');
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('⚠️ Notification creation error (non-critical):', err);
      // Never throw for notification errors - they're not critical for core functionality
      return null;
    }
  }
};

// Storage operations
export const storageService = {
  // Test if storage buckets exist
  async testStorageConnection(): Promise<{ success: boolean; buckets: string[]; error?: string }> {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        return { success: false, buckets: [], error: error.message };
      }
      
      const requiredBuckets = ['issue-photos', 'issue-audio', 'avatars'];
      const existingBuckets = buckets.map(b => b.name);
      const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
      
      if (missingBuckets.length > 0) {
        return { 
          success: false, 
          buckets: existingBuckets, 
          error: `Missing storage buckets: ${missingBuckets.join(', ')}` 
        };
      }
      
      return { success: true, buckets: existingBuckets };
    } catch (error) {
      return { 
        success: false, 
        buckets: [], 
        error: `Storage connection failed: ${(error as Error).message}` 
      };
    }
  },

  // Upload issue photo with progress tracking
  async uploadIssuePhoto(
    file: File, 
    userId: string, 
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    // Test connection first
    const connectionTest = await this.testStorageConnection();
    if (!connectionTest.success) {
      console.error('Storage connection failed:', connectionTest.error);
      throw new Error(`Storage not available: ${connectionTest.error}`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    try {
      onProgress?.(25);
      
      const { data, error } = await supabase.storage
        .from('issue-photos')
        .upload(filePath, file);
      
      if (error) throw error;
      
      onProgress?.(75);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('issue-photos')
        .getPublicUrl(data.path);
      
      onProgress?.(100);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading issue photo:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not configured. Please run the storage setup script.');
        } else if (error.message.includes('Policy')) {
          throw new Error('Storage permission denied. Please check your authentication.');
        } else if (error.message.includes('size')) {
          throw new Error('File too large. Maximum size is 5MB.');
        }
      }
      
      throw error;
    }
  },

  // Upload issue audio with progress tracking
  async uploadIssueAudio(
    file: File, 
    userId: string, 
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    // Test connection first
    const connectionTest = await this.testStorageConnection();
    if (!connectionTest.success) {
      console.error('Storage connection failed:', connectionTest.error);
      throw new Error(`Storage not available: ${connectionTest.error}`);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    try {
      onProgress?.(25);
      
      const { data, error } = await supabase.storage
        .from('issue-audio')
        .upload(filePath, file);
      
      if (error) throw error;
      
      onProgress?.(75);
      
      // Get signed URL (1 day expiry for audio files)
      const { data: urlData, error: signError } = await supabase.storage
        .from('issue-audio')
        .createSignedUrl(data.path, 86400); // 24 hours
      
      if (signError) throw signError;
      
      onProgress?.(100);
      return urlData.signedUrl;
    } catch (error) {
      console.error('Error uploading issue audio:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Bucket not found')) {
          throw new Error('Audio storage bucket not configured. Please run the storage setup script.');
        } else if (error.message.includes('Policy')) {
          throw new Error('Audio storage permission denied. Please check your authentication.');
        } else if (error.message.includes('size')) {
          throw new Error('Audio file too large. Maximum size is 10MB.');
        }
      }
      
      throw error;
    }
  },

  // Upload avatar
  async uploadAvatar(file: File, userId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    try {
      // First, try to remove existing avatar
      await this.deleteAvatar(userId);
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  // Delete avatar
  async deleteAvatar(userId: string): Promise<void> {
    try {
      // List files in user's avatar folder
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(userId);
      
      if (listError) return; // Ignore if folder doesn't exist
      
      if (files && files.length > 0) {
        const filePaths = files.map(file => `${userId}/${file.name}`);
        await supabase.storage
          .from('avatars')
          .remove(filePaths);
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      // Don't throw error for deletion failures
    }
  },

  // Generic file upload
  async uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      
      if (error) throw error;
      
      // Get public URL for public buckets
      if (bucket === 'issue-photos' || bucket === 'avatars') {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        
        return urlData.publicUrl;
      } else {
        // Get signed URL for private buckets
        const { data: urlData, error: signError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 3600);
        
        if (signError) throw signError;
        return urlData.signedUrl;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Delete file
  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Get signed URL for private files
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }
  },

  // Utility function to extract file path from URL
  getFilePathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'object');
      if (bucketIndex !== -1 && bucketIndex + 2 < pathParts.length) {
        return pathParts.slice(bucketIndex + 2).join('/');
      }
      return null;
    } catch {
      return null;
    }
  }
};

// Real-time subscriptions
export const realtimeService = {
  // Issue-related subscriptions
  subscribeToIssueUpdates(issueId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`issue-updates-${issueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_updates',
          filter: `issue_id=eq.${issueId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToIssueChanges(callback: (payload: any) => void) {
    return supabase
      .channel('issue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        callback
      )
      .subscribe();
  },

  // New: Subscribe to issues by status for admin dashboard
  subscribeToIssuesByStatus(status: string, callback: (payload: any) => void) {
    return supabase
      .channel(`issues-${status}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `status=eq.${status}`
        },
        callback
      )
      .subscribe();
  },

  // New: Subscribe to issues assigned to a specific user
  subscribeToAssignedIssues(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`assigned-issues-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `assigned_to=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // New: Subscribe to issues by department for department heads
  subscribeToIssuesByDepartment(departmentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`department-issues-${departmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `department_id=eq.${departmentId}`
        },
        callback
      )
      .subscribe();
  },

  // New: Subscribe to user profile changes
  subscribeToProfileChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Utility function to unsubscribe from a channel
  unsubscribe(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },

  // Utility function to unsubscribe all channels
  unsubscribeAll() {
    supabase.removeAllChannels();
  }
};

// Voting operations
export const voteService = {
  async getUserVote(issueId: string, userId: string): Promise<'upvote' | 'downvote' | null> {
    if (isDemoMode()) {
      return await demoService.getUserVote(issueId, userId);
    }

    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('issue_id', issueId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No vote found
          return null;
        }
        if (error.code === '42P01') {
          // Table doesn't exist, fall back to demo mode
          console.log('Votes table not found, falling back to demo mode');
          return await demoService.getUserVote(issueId, userId);
        }
        console.error('Error fetching user vote:', error);
        return null;
      }

      return data.vote_type;
    } catch (err) {
      console.error('getUserVote error:', err);
      return await demoService.getUserVote(issueId, userId);
    }
  },

  async voteOnIssue(issueId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<boolean> {
    if (isDemoMode()) {
      return await demoService.voteOnIssue(issueId, userId, voteType);
    }

    try {
      // Check if user already voted
      const existingVote = await this.getUserVote(issueId, userId);

      if (existingVote === voteType) {
        // User is trying to vote the same way, remove the vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('issue_id', issueId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error removing vote:', error);
          if (error.code === '42P01') {
            // Table doesn't exist, fall back to demo mode
            return await demoService.voteOnIssue(issueId, userId, voteType);
          }
          return false;
        }
        return true;
      } else if (existingVote) {
        // User is changing their vote
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteType, updated_at: new Date().toISOString() })
          .eq('issue_id', issueId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating vote:', error);
          if (error.code === '42P01') {
            return await demoService.voteOnIssue(issueId, userId, voteType);
          }
          return false;
        }
        return true;
      } else {
        // New vote
        const { error } = await supabase
          .from('votes')
          .insert({
            issue_id: issueId,
            user_id: userId,
            vote_type: voteType
          });

        if (error) {
          console.error('Error inserting vote:', error);
          if (error.code === '42P01') {
            return await demoService.voteOnIssue(issueId, userId, voteType);
          }
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error('Error voting on issue:', error);
      return await demoService.voteOnIssue(issueId, userId, voteType);
    }
  },

  async getVoteStats(issueId: string): Promise<{ upvotes: number; downvotes: number; userVote: 'upvote' | 'downvote' | null }> {
    if (isDemoMode()) {
      return await demoService.getVoteStats(issueId);
    }

    try {
      // Get vote counts
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('issue_id', issueId);

      if (votesError) {
        console.error('Error fetching vote stats:', votesError);
        if (votesError.code === '42P01') {
          // Table doesn't exist, fall back to demo mode
          return await demoService.getVoteStats(issueId);
        }
        return { upvotes: 0, downvotes: 0, userVote: null };
      }

      const upvotes = votes ? votes.filter(v => v.vote_type === 'upvote').length : 0;
      const downvotes = votes ? votes.filter(v => v.vote_type === 'downvote').length : 0;

      // Get current user's vote (if authenticated)
      let userVote: 'upvote' | 'downvote' | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userVote = await this.getUserVote(issueId, user.id);
        }
      } catch (error) {
        // User not authenticated, userVote remains null
      }

      return { upvotes, downvotes, userVote };
    } catch (error) {
      console.error('Error getting vote stats:', error);
      return await demoService.getVoteStats(issueId);
    }
  }
};

// Location-based operations
export const locationService = {
  async getNearbyIssues(userLat: number, userLng: number, radiusKm: number = 10): Promise<Issue[]> {
    if (isDemoMode()) {
      return await demoService.getNearbyIssues(userLat, userLng, radiusKm);
    }

    try {
      // Use PostGIS for efficient proximity search
      const { data, error } = await (supabase as any)
        .rpc('get_nearby_issues', {
          user_lat: userLat,
          user_lng: userLng,
          radius_km: radiusKm
        });

      if (error) {
        console.error('Error fetching nearby issues:', error);
        // Fallback to client-side filtering
        return await this.getNearbyIssuesFallback(userLat, userLng, radiusKm);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNearbyIssues:', error);
      // Fallback to client-side filtering
      return await this.getNearbyIssuesFallback(userLat, userLng, radiusKm);
    }
  },

  async getNearbyIssuesFallback(userLat: number, userLng: number, radiusKm: number = 10): Promise<Issue[]> {
    // Fallback method using client-side distance calculation
    console.log('🔄 Using fallback method for nearby issues');
    
    try {
      // First try with simple select to avoid foreign key issues
      const { data: issues, error } = await supabase
        .from('issues')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('❌ Error fetching issues for fallback:', error);
        // If Supabase fails, use demo data
        return await demoService.getNearbyIssues(userLat, userLng, radiusKm);
      }

      console.log(`✅ Fetched ${issues?.length || 0} issues for nearby calculation`);

      // Filter issues by distance on client side
      const nearbyIssues = (issues || []).filter((issue: any) => {
        if (!issue.latitude || !issue.longitude) return false;

        const distance = this.calculateDistance(
          userLat, userLng,
          issue.latitude, issue.longitude
        );

        return distance <= radiusKm;
      });

      return nearbyIssues;
    } catch (err) {
      console.error('❌ Fallback query failed:', err);
      // If all fails, use demo data
      return await demoService.getNearbyIssues(userLat, userLng, radiusKm);
    }
  },

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
};

