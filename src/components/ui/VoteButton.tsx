'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { voteService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VoteButtonProps {
  issueId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialUserVote?: 'upvote' | 'downvote' | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function VoteButton({
  issueId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  size = 'md',
  variant = 'ghost'
}: VoteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  // Load vote stats on mount
  useEffect(() => {
    const loadVoteStats = async () => {
      try {
        const stats = await voteService.getVoteStats(issueId);
        setUpvotes(stats.upvotes);
        setDownvotes(stats.downvotes);
        setUserVote(stats.userVote);
      } catch (error) {
        console.error('Error loading vote stats:', error);
      }
    };

    loadVoteStats();
  }, [issueId]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote on issues.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await voteService.voteOnIssue(issueId, user.id, voteType);

      if (success) {
        // Update local state optimistically
        const newUserVote = userVote === voteType ? null : voteType;

        if (userVote === voteType) {
          // Removing vote
          if (voteType === 'upvote') {
            setUpvotes(prev => prev - 1);
          } else {
            setDownvotes(prev => prev - 1);
          }
        } else if (userVote === null) {
          // Adding new vote
          if (voteType === 'upvote') {
            setUpvotes(prev => prev + 1);
          } else {
            setDownvotes(prev => prev + 1);
          }
        } else {
          // Changing vote
          if (voteType === 'upvote') {
            setUpvotes(prev => prev + 1);
            setDownvotes(prev => prev - 1);
          } else {
            setDownvotes(prev => prev + 1);
            setUpvotes(prev => prev - 1);
          }
        }

        setUserVote(newUserVote);

        toast({
          title: 'Vote Recorded',
          description: newUserVote ? `You ${newUserVote}d this issue.` : 'Your vote has been removed.',
        });
      } else {
        toast({
          title: 'Vote Failed',
          description: 'Unable to record your vote. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while voting.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Upvote Button */}
      <Button
        variant={userVote === 'upvote' ? 'default' : variant}
        size="sm"
        className={`${sizeClasses[size]} p-0 ${userVote === 'upvote' ? 'bg-green-600 hover:bg-green-700' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
      >
        <ChevronUp className={iconSizeClasses[size]} />
      </Button>

      {/* Vote Count */}
      <div className="text-center min-w-[3rem]">
        <span className={`font-semibold text-sm ${
          upvotes - downvotes > 0 ? 'text-green-600' :
          upvotes - downvotes < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {upvotes - downvotes}
        </span>
        <div className="text-xs text-gray-500 leading-tight">
          <div>{upvotes}↑</div>
          <div>{downvotes}↓</div>
        </div>
      </div>

      {/* Downvote Button */}
      <Button
        variant={userVote === 'downvote' ? 'default' : variant}
        size="sm"
        className={`${sizeClasses[size]} p-0 ${userVote === 'downvote' ? 'bg-red-600 hover:bg-red-700' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
      >
        <ChevronDown className={iconSizeClasses[size]} />
      </Button>
    </div>
  );
}