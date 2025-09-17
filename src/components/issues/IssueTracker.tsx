"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Eye,
  ThumbsUp,
  MessageCircle,
  Loader2 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { IssueReport } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/issues/StatusBadge';

export function IssueTracker() {
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reports'),
      where('citizenId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IssueReport[];
      
      setIssues(issuesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching issues:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your issues. Please try again.',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleVote = async (issueId: string) => {
    if (!user) return;

    try {
      const issueRef = doc(db, 'reports', issueId);
      const issue = issues.find(i => i.id === issueId);
      
      if (issue && !issue.votedBy.includes(user.id)) {
        await updateDoc(issueRef, {
          votes: (issue.votes || 0) + 1,
          votedBy: arrayUnion(user.id)
        });

        toast({
          title: 'Vote recorded',
          description: 'Thank you for supporting this issue!',
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to record your vote. Please try again.',
      });
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'submitted': return 25;
      case 'acknowledged': return 50;
      case 'in_progress': return 75;
      case 'resolved': return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'acknowledged': return <Eye className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Unknown';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Your Issue Reports ({issues.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{issue.location.city}, {issue.location.state}</span>
                        </span>
                        <span>Reported: {formatDate(issue.createdAt)}</span>
                        <span className="capitalize">{issue.category.replace('_', ' ')}</span>
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

                  {/* Progress Notes */}
                  {issue.progressNotes && issue.progressNotes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">Updates:</h4>
                      <div className="space-y-2">
                        {issue.progressNotes.slice(-3).map((note, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                            <p className="text-gray-700">{note.note}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {note.adminName} • {formatDate(note.timestamp)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(issue.id)}
                        disabled={issue.votedBy?.includes(user.id)}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{issue.votes || 0}</span>
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
                        <p className="text-sm text-gray-600">{issue.department}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Full Address:</h4>
                        <p className="text-sm text-gray-600">{issue.location.address}</p>
                      </div>
                      
                      {issue.photos && issue.photos.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Photos:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {issue.photos.map((photo, index) => (
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
    </div>
  );
}