import { supabase } from './supabase';
import { issueService } from './database';
import type { Database } from './database.types';

type Issue = Database['public']['Tables']['issues']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  department?: Database['public']['Tables']['departments']['Row'];
};

interface SimilarityScore {
  issue: Issue;
  score: number;
  reasons: string[];
}

interface DuplicationCheck {
  isDuplicate: boolean;
  similarIssues: SimilarityScore[];
  threshold: number;
}

/**
 * Service for detecting and preventing duplicate issues
 */
export class DuplicateDetectionService {
  private static readonly SIMILARITY_THRESHOLD = 0.7; // 70% similarity threshold
  private static readonly LOCATION_RADIUS_KM = 0.5; // 500m radius for location similarity

  /**
   * Check if an issue is likely a duplicate of existing issues
   */
  static async checkForDuplicates(
    title: string,
    description: string,
    categoryId?: string,
    latitude?: number,
    longitude?: number
  ): Promise<DuplicationCheck> {
    try {
      // Get all issues for comparison (in production, this should be optimized)
      const allIssues = await issueService.getAllIssues();
      
      // Filter issues by category if provided (reduces search space)
      const candidateIssues = categoryId 
        ? allIssues.filter(issue => issue.category_id === categoryId)
        : allIssues;

      const similarityScores: SimilarityScore[] = [];

      for (const issue of candidateIssues) {
        const score = this.calculateSimilarityScore(
          { title, description, categoryId, latitude, longitude },
          issue
        );

        if (score.score > 0.3) { // Only include issues with some similarity
          similarityScores.push(score);
        }
      }

      // Sort by similarity score (highest first)
      similarityScores.sort((a, b) => b.score - a.score);

      // Check if any issue exceeds the duplicate threshold
      const isDuplicate = similarityScores.length > 0 && 
                         similarityScores[0].score >= this.SIMILARITY_THRESHOLD;

      return {
        isDuplicate,
        similarIssues: similarityScores.slice(0, 5), // Return top 5 similar issues
        threshold: this.SIMILARITY_THRESHOLD
      };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return {
        isDuplicate: false,
        similarIssues: [],
        threshold: this.SIMILARITY_THRESHOLD
      };
    }
  }

  /**
   * Calculate similarity score between two issues
   */
  private static calculateSimilarityScore(
    newIssue: {
      title: string;
      description: string;
      categoryId?: string;
      latitude?: number;
      longitude?: number;
    },
    existingIssue: Issue
  ): SimilarityScore {
    const reasons: string[] = [];
    let totalScore = 0;
    let weightSum = 0;

    // Title similarity (weight: 40%)
    const titleWeight = 0.4;
    const titleSimilarity = this.calculateTextSimilarity(newIssue.title, existingIssue.title);
    totalScore += titleSimilarity * titleWeight;
    weightSum += titleWeight;

    if (titleSimilarity > 0.6) {
      reasons.push(`Similar title (${Math.round(titleSimilarity * 100)}% match)`);
    }

    // Description similarity (weight: 30%)
    const descriptionWeight = 0.3;
    const descriptionSimilarity = this.calculateTextSimilarity(
      newIssue.description, 
      existingIssue.description
    );
    totalScore += descriptionSimilarity * descriptionWeight;
    weightSum += descriptionWeight;

    if (descriptionSimilarity > 0.5) {
      reasons.push(`Similar description (${Math.round(descriptionSimilarity * 100)}% match)`);
    }

    // Category similarity (weight: 15%)
    const categoryWeight = 0.15;
    const categorySimilarity = newIssue.categoryId === existingIssue.category_id ? 1 : 0;
    totalScore += categorySimilarity * categoryWeight;
    weightSum += categoryWeight;

    if (categorySimilarity === 1) {
      reasons.push('Same category');
    }

    // Location similarity (weight: 15%)
    const locationWeight = 0.15;
    let locationSimilarity = 0;

    if (newIssue.latitude && newIssue.longitude && 
        existingIssue.latitude && existingIssue.longitude) {
      const distance = this.calculateDistance(
        newIssue.latitude, newIssue.longitude,
        existingIssue.latitude, existingIssue.longitude
      );

      if (distance <= this.LOCATION_RADIUS_KM) {
        locationSimilarity = 1 - (distance / this.LOCATION_RADIUS_KM);
        reasons.push(`Same location (${Math.round(distance * 1000)}m away)`);
      }
    }

    totalScore += locationSimilarity * locationWeight;
    weightSum += locationWeight;

    // Normalize score
    const finalScore = weightSum > 0 ? totalScore / weightSum : 0;

    return {
      issue: existingIssue,
      score: finalScore,
      reasons
    };
  }

  /**
   * Calculate text similarity using Jaccard similarity
   */
  private static calculateTextSimilarity(text1: string, text2: string): number {
    // Normalize text: lowercase, remove punctuation, split into words
    const normalize = (text: string): Set<string> => {
      return new Set(
        text.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2) // Ignore very short words
      );
    };

    const words1 = normalize(text1);
    const words2 = normalize(text2);

    // Calculate Jaccard similarity: intersection / union
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  private static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if user can vote on an issue (area-based restrictions)
   */
  static async canUserVoteOnIssue(
    userId: string,
    issue: Issue,
    userLatitude?: number,
    userLongitude?: number
  ): Promise<{ canVote: boolean; reason: string }> {
    try {
      // Check if user is the reporter of this issue
      if (issue.user_id === userId) {
        return { canVote: true, reason: 'You reported this issue' };
      }

      // Check if user has reported a similar issue
      const userIssues = await issueService.getUserIssues(userId);
      
      for (const userIssue of userIssues) {
        const similarity = this.calculateSimilarityScore(
          {
            title: userIssue.title,
            description: userIssue.description,
            categoryId: userIssue.category_id || undefined,
            latitude: userIssue.latitude || undefined,
            longitude: userIssue.longitude || undefined
          },
          issue
        );

        if (similarity.score > 0.5) { // 50% similarity threshold for voting rights
          return { 
            canVote: true, 
            reason: 'You reported a similar issue' 
          };
        }
      }

      // Check if user is in the same area
      if (userLatitude && userLongitude && issue.latitude && issue.longitude) {
        const distance = this.calculateDistance(
          userLatitude, userLongitude,
          issue.latitude, issue.longitude
        );

        if (distance <= 5) { // 5km radius for voting
          return { 
            canVote: true, 
            reason: `Issue is in your area (${Math.round(distance * 1000)}m away)` 
          };
        }

        return { 
          canVote: false, 
          reason: `Issue is too far from your location (${Math.round(distance)}km away)` 
        };
      }

      return { 
        canVote: false, 
        reason: 'Unable to determine your location or issue location' 
      };

    } catch (error) {
      console.error('Error checking voting permissions:', error);
      return { 
        canVote: false, 
        reason: 'Error checking permissions' 
      };
    }
  }

  /**
   * Get voting restrictions explanation for UI
   */
  static getVotingRulesExplanation(): string[] {
    return [
      'You can vote on issues you reported',
      'You can vote on issues similar to ones you\'ve reported',
      'You can vote on issues within 5km of your location',
      'Location access is required for area-based voting'
    ];
  }
}

export const duplicateDetectionService = DuplicateDetectionService;