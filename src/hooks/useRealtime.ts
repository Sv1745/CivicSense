import { useEffect, useState } from 'react';
import { realtimeService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// Hook for subscribing to issue updates
export const useIssueUpdates = (issueId: string) => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;

    const subscription = realtimeService.subscribeToIssueUpdates(issueId, (payload) => {
      console.log('Issue update received:', payload);
      setUpdates(prev => [...prev, payload]);
      setLoading(false);
    });

    return () => {
      realtimeService.unsubscribe(subscription);
    };
  }, [issueId]);

  return { updates, loading };
};

// Hook for subscribing to user notifications
export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const subscription = realtimeService.subscribeToUserNotifications(user.id, (payload) => {
      console.log('Notification received:', payload);
      
      if (payload.eventType === 'INSERT') {
        setNotifications(prev => [payload.new, ...prev]);
        if (!payload.new.read) {
          setUnreadCount(prev => prev + 1);
        }
      } else if (payload.eventType === 'UPDATE') {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === payload.new.id ? payload.new : notif
          )
        );
        
        // Update unread count
        if (payload.old.read !== payload.new.read) {
          setUnreadCount(prev => payload.new.read ? prev - 1 : prev + 1);
        }
      }
      setLoading(false);
    });

    return () => {
      realtimeService.unsubscribe(subscription);
    };
  }, [user?.id]);

  return { notifications, unreadCount, loading };
};

// Hook for subscribing to issue changes (for admin dashboard)
export const useIssueChanges = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    submitted: 0,
    acknowledged: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });

  const updateMetrics = (issueList: any[]) => {
    const newMetrics = {
      total: issueList.length,
      submitted: issueList.filter(i => i.status === 'submitted').length,
      acknowledged: issueList.filter(i => i.status === 'acknowledged').length,
      in_progress: issueList.filter(i => i.status === 'in_progress').length,
      resolved: issueList.filter(i => i.status === 'resolved').length,
      closed: issueList.filter(i => i.status === 'closed').length,
    };
    setMetrics(newMetrics);
  };

  useEffect(() => {
    const subscription = realtimeService.subscribeToIssueChanges((payload) => {
      console.log('Issue change received:', payload);
      
      if (payload.eventType === 'INSERT') {
        setIssues(prev => {
          const updated = [payload.new, ...prev];
          updateMetrics(updated);
          return updated;
        });
      } else if (payload.eventType === 'UPDATE') {
        setIssues(prev => {
          const updated = prev.map(issue => 
            issue.id === payload.new.id ? payload.new : issue
          );
          updateMetrics(updated);
          return updated;
        });
      } else if (payload.eventType === 'DELETE') {
        setIssues(prev => {
          const updated = prev.filter(issue => issue.id !== payload.old.id);
          updateMetrics(updated);
          return updated;
        });
      }
      setLoading(false);
    });

    return () => {
      realtimeService.unsubscribe(subscription);
    };
  }, []);

  return { issues, metrics, loading };
};

// Hook for subscribing to assigned issues
export const useAssignedIssues = () => {
  const { user } = useAuth();
  const [assignedIssues, setAssignedIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const subscription = realtimeService.subscribeToAssignedIssues(user.id, (payload) => {
      console.log('Assigned issue update received:', payload);
      
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        // Only include issues that are currently assigned to this user
        if (payload.new.assigned_to === user.id) {
          setAssignedIssues(prev => {
            const existing = prev.find(issue => issue.id === payload.new.id);
            if (existing) {
              return prev.map(issue => 
                issue.id === payload.new.id ? payload.new : issue
              );
            } else {
              return [payload.new, ...prev];
            }
          });
        } else {
          // Issue was unassigned from this user
          setAssignedIssues(prev => prev.filter(issue => issue.id !== payload.new.id));
        }
      } else if (payload.eventType === 'DELETE') {
        setAssignedIssues(prev => prev.filter(issue => issue.id !== payload.old.id));
      }
      setLoading(false);
    });

    return () => {
      realtimeService.unsubscribe(subscription);
    };
  }, [user?.id]);

  return { assignedIssues, loading };
};

// Hook for subscribing to department issues
export const useDepartmentIssues = (departmentId: string) => {
  const [departmentIssues, setDepartmentIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) return;

    const subscription = realtimeService.subscribeToIssuesByDepartment(departmentId, (payload) => {
      console.log('Department issue update received:', payload);
      
      if (payload.eventType === 'INSERT') {
        setDepartmentIssues(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setDepartmentIssues(prev => 
          prev.map(issue => 
            issue.id === payload.new.id ? payload.new : issue
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setDepartmentIssues(prev => prev.filter(issue => issue.id !== payload.old.id));
      }
      setLoading(false);
    });

    return () => {
      realtimeService.unsubscribe(subscription);
    };
  }, [departmentId]);

  return { departmentIssues, loading };
};

// Hook for subscribing to profile changes
export const useProfileChanges = () => {
  const { user } = useAuth();
  const [profileUpdates, setProfileUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const subscription = realtimeService.subscribeToProfileChanges(user.id, (payload) => {
      console.log('Profile change received:', payload);
      setProfileUpdates(prev => [payload, ...prev]);
    });

    return () => {
      realtimeService.unsubscribe(subscription);
    };
  }, [user?.id]);

  return { profileUpdates };
};