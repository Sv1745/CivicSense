'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Eye, ThumbsUp, MapPin, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { VoteButton } from '@/components/ui/VoteButton';
import { duplicateDetectionService } from '@/lib/duplicate-detection';
import type { Database } from '@/lib/database.types';

type Issue = Database['public']['Tables']['issues']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  department?: Database['public']['Tables']['departments']['Row'];
};

interface SimilarityScore {
  issue: Issue;
  score: number;
  reasons: string[];
}

interface DuplicateCheckProps {
  title: string;
  description: string;
  categoryId?: string;
  latitude?: number;
  longitude?: number;
  onDuplicateFound?: (isDuplicate: boolean) => void;
  className?: string;
}

export function DuplicateCheck({
  title,
  description,
  categoryId,
  latitude,
  longitude,
  onDuplicateFound,
  className = ''
}: DuplicateCheckProps) {
  const [checking, setChecking] = useState(false);
  const [similarIssues, setSimilarIssues] = useState<SimilarityScore[]>([]);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);

  // Check for duplicates when inputs change
  useEffect(() => {
    if (title.length < 10 || description.length < 20) {
      setSimilarIssues([]);
      setIsDuplicate(false);
      onDuplicateFound?.(false);
      return;
    }

    const checkDuplicates = async () => {
      setChecking(true);
      try {
        const result = await duplicateDetectionService.checkForDuplicates(
          title,
          description,
          categoryId,
          latitude,
          longitude
        );

        setSimilarIssues(result.similarIssues);
        setIsDuplicate(result.isDuplicate);
        onDuplicateFound?.(result.isDuplicate);
      } catch (error) {
        console.error('Error checking duplicates:', error);
      } finally {
        setChecking(false);
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkDuplicates, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, description, categoryId, latitude, longitude, onDuplicateFound]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-amber-600';
    return 'text-blue-600';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'Very Similar';
    if (score >= 0.6) return 'Similar';
    return 'Somewhat Similar';
  };

  if (checking) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-gray-600">Checking for similar issues...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (similarIssues.length === 0) {
    return null; // No similar issues found
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Duplicate Warning */}
      {isDuplicate && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Possible Duplicate Issue Detected!</strong>
            <br />
            We found very similar issues already reported. Please check if your issue matches any of the existing ones below before creating a new report.
          </AlertDescription>
        </Alert>
      )}

      {/* Similar Issues Found */}
      {!isDuplicate && similarIssues.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <CheckCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            We found {similarIssues.length} similar issue{similarIssues.length > 1 ? 's' : ''} that might be related to yours.
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-amber-700 underline ml-1"
              onClick={() => setShowSimilar(!showSimilar)}
            >
              {showSimilar ? 'Hide' : 'View'} similar issues
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Similar Issues List */}
      {(showSimilar || isDuplicate) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Similar Issues Found</span>
              <Badge variant="secondary">{similarIssues.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {similarIssues.map((similar, index) => (
              <Card key={similar.issue.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header with similarity score */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1">
                          {similar.issue.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={getSimilarityColor(similar.score)}
                        >
                          {getSimilarityLabel(similar.score)} ({Math.round(similar.score * 100)}%)
                        </Badge>
                      </div>
                      <StatusBadge status={similar.issue.status} />
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {similar.issue.description}
                    </p>

                    {/* Similarity reasons */}
                    <div className="flex flex-wrap gap-1">
                      {similar.reasons.map((reason, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(similar.issue.created_at)}</span>
                      </div>
                      {similar.issue.latitude && similar.issue.longitude && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {similar.issue.latitude.toFixed(4)}, {similar.issue.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                      <div>
                        Category: {similar.issue.category?.name || 'General'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <VoteButton
                        issueId={similar.issue.id}
                        size="sm"
                      />
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`/issues/${similar.issue.id}`, '_blank');
                          }}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Details</span>
                        </Button>
                        
                        {similar.score >= 0.7 && (
                          <Button
                            size="sm"
                            onClick={() => {
                              // Instead of creating new issue, vote on this one
                              window.location.href = `/issues/${similar.issue.id}`;
                            }}
                            className="flex items-center space-x-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Support This</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Voting Rules Information */}
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Voting Guidelines:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  {duplicateDetectionService.getVotingRulesExplanation().map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}