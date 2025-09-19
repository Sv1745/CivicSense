// Demo mode data service - uses localStorage when Supabase credentials are not available
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Issue = Tables['issues']['Row'];
type Category = Tables['categories']['Row'];
type Department = Tables['departments']['Row'];

// Check if we're in demo mode
export const isDemoMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Enable demo mode if Supabase credentials are missing or placeholder
  return !url || !key || url.includes('your-project-ref') || key.includes('your-anon-key') || url.includes('demo') || key.includes('demo');
};

// Demo data
const demoCategories: Category[] = [
  {
    id: '1',
    name: 'Infrastructure',
    description: 'Roads, bridges, public buildings',
    icon: '🏗️',
    color: '#3B82F6',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Environment',
    description: 'Pollution, waste management, parks',
    icon: '🌿',
    color: '#10B981',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Safety',
    description: 'Street lighting, security issues',
    icon: '🚨',
    color: '#EF4444',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Transportation',
    description: 'Traffic, public transport',
    icon: '🚌',
    color: '#8B5CF6',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Utilities',
    description: 'Water, electricity, gas issues',
    icon: '⚡',
    color: '#F59E0B',
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Health & Sanitation',
    description: 'Public health, cleanliness',
    icon: '🏥',
    color: '#EC4899',
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Parks & Recreation',
    description: 'Parks, playgrounds, recreational facilities',
    icon: '🌳',
    color: '#22C55E',
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Housing',
    description: 'Housing issues, illegal constructions',
    icon: '🏠',
    color: '#6366F1',
    created_at: new Date().toISOString()
  }
];

const demoDepartments: Department[] = [
  {
    id: '1',
    name: 'Public Works Department',
    description: 'Infrastructure and utilities management',
    contact_email: 'publicworks@city.gov',
    contact_phone: '+91-11-2345-0101',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Environmental Services',
    description: 'Waste management and environmental protection',
    contact_email: 'environment@city.gov',
    contact_phone: '+91-11-2345-0102',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Transportation Department',
    description: 'Traffic and public transportation',
    contact_email: 'transport@city.gov',
    contact_phone: '+91-11-2345-0103',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Public Safety Department',
    description: 'Security and emergency services',
    contact_email: 'safety@city.gov',
    contact_phone: '+91-11-2345-0104',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Health Department',
    description: 'Public health and sanitation',
    contact_email: 'health@city.gov',
    contact_phone: '+91-11-2345-0105',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Parks & Recreation Department',
    description: 'Parks, green spaces, and recreational facilities',
    contact_email: 'parks@city.gov',
    contact_phone: '+91-11-2345-0106',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Housing & Urban Development',
    description: 'Housing policies, urban planning, building permits',
    contact_email: 'housing@city.gov',
    contact_phone: '+91-11-2345-0107',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Utilities Commission',
    description: 'Water, electricity, gas, telecommunications',
    contact_email: 'utilities@city.gov',
    contact_phone: '+91-11-2345-0108',
    jurisdiction: 'City',
    state: 'Multi-State',
    city: 'Various Cities',
    created_at: new Date().toISOString()
  }
];

// Initialize demo data in localStorage
const initDemoData = () => {
  if (typeof window === 'undefined') return;
  
  // Force refresh demo data on each load to get latest updates
  localStorage.setItem('demo_categories', JSON.stringify(demoCategories));
  localStorage.setItem('demo_departments', JSON.stringify(demoDepartments));
  
  // Initialize with sample issues if empty
  if (!localStorage.getItem('demo_issues') || JSON.parse(localStorage.getItem('demo_issues') || '[]').length === 0) {
    const sampleIssues: Issue[] = [
      {
        id: '1',
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic hazards near the intersection of Main Street and Oak Avenue.',
        category_id: '1',
        department_id: '1',
        user_id: 'demo-user-1',
        priority: 'high',
        status: 'submitted',
        verification_status: 'pending',
        photo_urls: null,
        audio_url: null,
        latitude: 28.6139,
        longitude: 77.2090,
        vote_count: 5,
        assigned_to: null,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        resolved_at: null
      },
      {
        id: '2',
        title: 'Street Light Not Working',
        description: 'The street light at the corner of Elm Street and Pine Road has been out for a week.',
        category_id: '3',
        department_id: '4',
        user_id: 'demo-user-1',
        priority: 'medium',
        status: 'in_progress',
        verification_status: 'verified',
        photo_urls: null,
        audio_url: null,
        latitude: 28.7041,
        longitude: 77.1025,
        vote_count: 3,
        assigned_to: 'admin-user',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        resolved_at: null
      }
    ];
    localStorage.setItem('demo_issues', JSON.stringify(sampleIssues));
  }
  
  // Initialize with sample profiles if empty
  if (!localStorage.getItem('demo_profiles') || JSON.parse(localStorage.getItem('demo_profiles') || '[]').length === 0) {
    const sampleProfiles: Profile[] = [
      {
        id: 'demo-user-1',
        email: 'demo@example.com',
        full_name: 'Demo User',
        avatar_url: null,
        phone: '+91-9876543210',
        address: '123 Demo Street',
        city: 'New Delhi',
        state: 'Delhi',
        role: 'citizen',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'admin-user',
        email: 'admin@example.com',
        full_name: 'Admin User',
        avatar_url: null,
        phone: '+91-9876543212',
        address: '789 Admin Road',
        city: 'Bangalore',
        state: 'Karnataka',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('demo_profiles', JSON.stringify(sampleProfiles));
  }
};

// Demo service functions
export const demoService = {
  // Initialize demo data
  init: () => {
    if (isDemoMode()) {
      initDemoData();
      console.log('🎭 Demo Mode: Using localStorage for data persistence');
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('demo_categories') || '[]');
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('demo_departments') || '[]');
  },

  // Issues
  getAllIssues: async (): Promise<Issue[]> => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('demo_issues') || '[]');
  },

  createIssue: async (issueData: Tables['issues']['Insert']): Promise<Issue | null> => {
    if (typeof window === 'undefined') return null;
    
    const issues = JSON.parse(localStorage.getItem('demo_issues') || '[]');
    const newIssue: Issue = {
      id: Date.now().toString(),
      title: issueData.title,
      description: issueData.description,
      category_id: issueData.category_id,
      department_id: issueData.department_id,
      user_id: issueData.user_id,
      priority: issueData.priority,
      status: issueData.status || 'submitted',
      verification_status: issueData.verification_status || 'pending',
      photo_urls: issueData.photo_urls || null,
      audio_url: issueData.audio_url || null,
      latitude: issueData.latitude || null,
      longitude: issueData.longitude || null,
      vote_count: issueData.vote_count || 0,
      assigned_to: issueData.assigned_to || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolved_at: issueData.resolved_at || null
    };
    
    issues.push(newIssue);
    localStorage.setItem('demo_issues', JSON.stringify(issues));
    return newIssue;
  },

  updateIssue: async (issueId: string, updates: Tables['issues']['Update']): Promise<Issue | null> => {
    if (typeof window === 'undefined') return null;
    
    const issues: Issue[] = JSON.parse(localStorage.getItem('demo_issues') || '[]');
    const issueIndex = issues.findIndex(issue => issue.id === issueId);
    
    if (issueIndex === -1) return null;
    
    issues[issueIndex] = {
      ...issues[issueIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('demo_issues', JSON.stringify(issues));
    return issues[issueIndex];
  },

  // Profiles
  getProfile: async (userId: string): Promise<Profile | null> => {
    if (typeof window === 'undefined') return null;
    
    const profiles: Profile[] = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    return profiles.find(profile => profile.id === userId) || null;
  },

  createProfile: async (profileData: Tables['profiles']['Insert']): Promise<Profile | null> => {
    if (typeof window === 'undefined') return null;
    
    const profiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    const newProfile: Profile = {
      id: profileData.id,
      email: profileData.email,
      full_name: profileData.full_name || null,
      avatar_url: profileData.avatar_url || null,
      phone: profileData.phone || null,
      address: profileData.address || null,
      city: profileData.city || null,
      state: profileData.state || null,
      role: profileData.role || 'citizen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    profiles.push(newProfile);
    localStorage.setItem('demo_profiles', JSON.stringify(profiles));
    return newProfile;
  },

  updateProfile: async (userId: string, updates: Tables['profiles']['Update']): Promise<Profile | null> => {
    if (typeof window === 'undefined') return null;
    
    const profiles: Profile[] = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    const profileIndex = profiles.findIndex(profile => profile.id === userId);
    
    if (profileIndex === -1) return null;
    
    profiles[profileIndex] = {
      ...profiles[profileIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('demo_profiles', JSON.stringify(profiles));
    return profiles[profileIndex];
  },

  getUserCount: async (): Promise<number> => {
    if (typeof window === 'undefined') return 0;
    const profiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    return profiles.length;
  },

  // File upload simulation
  uploadFile: async (file: File): Promise<string> => {
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a fake URL for demo purposes
    return `https://demo-storage.com/files/${Date.now()}_${file.name}`;
  },

  // Clear demo data
  clearData: () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('demo_categories');
    localStorage.removeItem('demo_departments');
    localStorage.removeItem('demo_issues');
    localStorage.removeItem('demo_profiles');
    localStorage.removeItem('demo_votes');
    console.log('🧹 Demo data cleared');
  },

  // Voting functions for demo mode
  getUserVote: async (issueId: string, userId: string): Promise<'upvote' | 'downvote' | null> => {
    if (typeof window === 'undefined') return null;

    const votes = JSON.parse(localStorage.getItem('demo_votes') || '[]');
    const userVote = votes.find((v: any) => v.issue_id === issueId && v.user_id === userId);
    return userVote ? userVote.vote_type : null;
  },

  voteOnIssue: async (issueId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const votes = JSON.parse(localStorage.getItem('demo_votes') || '[]');
    const existingVoteIndex = votes.findIndex((v: any) => v.issue_id === issueId && v.user_id === userId);

    if (existingVoteIndex >= 0) {
      const existingVote = votes[existingVoteIndex];
      if (existingVote.vote_type === voteType) {
        // Remove vote
        votes.splice(existingVoteIndex, 1);
      } else {
        // Change vote
        votes[existingVoteIndex] = {
          ...existingVote,
          vote_type: voteType,
          updated_at: new Date().toISOString()
        };
      }
    } else {
      // Add new vote
      votes.push({
        id: Date.now().toString(),
        issue_id: issueId,
        user_id: userId,
        vote_type: voteType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    localStorage.setItem('demo_votes', JSON.stringify(votes));

    // Update issue vote count
    const issues = JSON.parse(localStorage.getItem('demo_issues') || '[]');
    const issueIndex = issues.findIndex((i: any) => i.id === issueId);

    if (issueIndex >= 0) {
      const upvotes = votes.filter((v: any) => v.issue_id === issueId && v.vote_type === 'upvote').length;
      const downvotes = votes.filter((v: any) => v.issue_id === issueId && v.vote_type === 'downvote').length;
      issues[issueIndex].vote_count = upvotes - downvotes;
      localStorage.setItem('demo_issues', JSON.stringify(issues));
    }

    return true;
  },

  getVoteStats: async (issueId: string): Promise<{ upvotes: number; downvotes: number; userVote: 'upvote' | 'downvote' | null }> => {
    if (typeof window === 'undefined') return { upvotes: 0, downvotes: 0, userVote: null };

    const votes = JSON.parse(localStorage.getItem('demo_votes') || '[]');
    const issueVotes = votes.filter((v: any) => v.issue_id === issueId);

    const upvotes = issueVotes.filter((v: any) => v.vote_type === 'upvote').length;
    const downvotes = issueVotes.filter((v: any) => v.vote_type === 'downvote').length;

    // For demo, assume current user is the first profile
    const profiles = JSON.parse(localStorage.getItem('demo_profiles') || '[]');
    const currentUser = profiles.length > 0 ? profiles[0] : null;
    const userVote = currentUser ? await demoService.getUserVote(issueId, currentUser.id) : null;

    return { upvotes, downvotes, userVote };
  },

  // Location functions for demo mode
  getNearbyIssues: async (userLat: number, userLng: number, radiusKm: number = 10): Promise<Issue[]> => {
    if (typeof window === 'undefined') return [];

    const issues = JSON.parse(localStorage.getItem('demo_issues') || '[]');

    return issues.filter((issue: any) => {
      if (!issue.latitude || !issue.longitude) return false;

      const distance = demoService.calculateDistance(
        userLat, userLng,
        issue.latitude, issue.longitude
      );

      return distance <= radiusKm;
    });
  },

  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = demoService.toRadians(lat2 - lat1);
    const dLng = demoService.toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(demoService.toRadians(lat1)) * Math.cos(demoService.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRadians: (degrees: number): number => {
    return degrees * (Math.PI / 180);
  }
};