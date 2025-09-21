'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { voteService, issueService } from '@/lib/database';
import { duplicateDetectionService } from '@/lib/duplicate-detection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocationFilter } from '@/hooks/useLocation';

interface VoteButtonProps {
  issueId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialUserVote?: 'upvote' | 'downvote' | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  enforceAreaRestrictions?: boolean;
}

export function VoteButton({
  issueId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  size = 'md',
  variant = 'ghost',
  enforceAreaRestrictions = true
}: VoteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useLocationFilter();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);
  const [canVote, setCanVote] = useState(true);
  const [votingReason, setVotingReason] = useState('');
  const [issue, setIssue] = useState<any>(null);

  // Load vote stats and check permissions on mount
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

    const loadIssueAndCheckPermissions = async () => {
      if (!user || !enforceAreaRestrictions) {
        setCanVote(true);
        setVotingReason('');
        return;
      }

      try {
        // Load issue details
        const issueData = await issueService.getIssueById(issueId);
        setIssue(issueData);

        if (!issueData) {
          setCanVote(false);
          setVotingReason('Issue not found');
          return;
        }

        // Check voting permissions
        const result = await duplicateDetectionService.canUserVoteOnIssue(
          user.id,
          issueData,
          location?.latitude,
          location?.longitude
        );

        setCanVote(result.canVote);
        setVotingReason(result.reason);
      } catch (error) {
        console.error('Error checking voting permissions:', error);
        setCanVote(false);
        setVotingReason('Error checking permissions');
      }
    };

    loadVoteStats();
    loadIssueAndCheckPermissions();
  }, [issueId, user, location, enforceAreaRestrictions]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote on issues.',
        variant: 'destructive'
      });
      return;
    }

    if (enforceAreaRestrictions && !canVote) {
      toast({
        title: 'Voting Restricted',
        description: votingReason,
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

  const isVotingDisabled = isLoading || (enforceAreaRestrictions && !canVote);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-2 min-w-[60px] relative">
        {/* Voting restriction indicator */}
        {enforceAreaRestrictions && !canVote && (
          <div className="absolute -top-2 -right-2 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-amber-500 text-white rounded-full p-1">
                  <Info className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{votingReason}</p>
                {location && (
                  <p className="text-xs mt-1 text-gray-300">
                    Enable location access for area-based voting
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Upvote Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${userVote === 'upvote' 
                  ? 'bg-green-500 border-green-500 text-white shadow-lg transform scale-110' 
                  : 'bg-white border-gray-300 text-gray-600'
                }
                ${isVotingDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:scale-105 hover:border-green-400 hover:text-green-500 hover:shadow-md'
                }
              `}
              onClick={() => handleVote('upvote')}
              disabled={isVotingDisabled}
            >
              <ChevronUp className={`${iconSizeClasses[size]} stroke-[2.5]`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-sm">
              {isVotingDisabled && enforceAreaRestrictions ? votingReason : 'Upvote this issue'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Vote Count */}
        <div className="text-center">
          <div className={`font-bold text-lg leading-none ${
            upvotes - downvotes > 0 ? 'text-green-600' :
            upvotes - downvotes < 0 ? 'text-red-600' : 'text-gray-700'
          }`}>
            {upvotes - downvotes}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {upvotes + downvotes} votes
          </div>
        </div>

        {/* Downvote Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${userVote === 'downvote' 
                  ? 'bg-red-500 border-red-500 text-white shadow-lg transform scale-110' 
                  : 'bg-white border-gray-300 text-gray-600'
                }
                ${isVotingDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:scale-105 hover:border-red-400 hover:text-red-500 hover:shadow-md'
                }
              `}
              onClick={() => handleVote('downvote')}
              disabled={isVotingDisabled}
            >
              <ChevronDown className={`${iconSizeClasses[size]} stroke-[2.5]`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-sm">
              {isVotingDisabled && enforceAreaRestrictions ? votingReason : 'Downvote this issue'}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}