import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'citizen' | 'admin' | 'department';
  department?: string;
  createdAt: Timestamp;
  fcmToken?: string;
}

export interface IssueReport {
  id: string;
  citizenId: string;
  citizenEmail: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    state: string;
    city: string;
    jurisdiction: string;
  };
  department: string;
  assignedTo?: string;
  photos: string[]; // Firebase Storage URLs
  audioNote?: string; // Firebase Storage URL
  createdAt: Timestamp;
  updatedAt: Timestamp;
  acknowledgedAt?: Timestamp;
  inProgressAt?: Timestamp;
  resolvedAt?: Timestamp;
  progressNotes: ProgressNote[];
  votes: number;
  votedBy: string[];
}

export interface ProgressNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  timestamp: Timestamp;
  images?: string[];
}

export type IssueCategory = 
  | 'road_infrastructure'
  | 'water_supply'
  | 'electricity'
  | 'waste_management'
  | 'public_transport'
  | 'street_lighting'
  | 'parks_recreation'
  | 'public_safety'
  | 'noise_pollution'
  | 'air_pollution'
  | 'other';

export type IssueStatus = 
  | 'submitted'
  | 'acknowledged' 
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Department {
  id: string;
  name: string;
  categories: IssueCategory[];
  jurisdictions: string[];
  contactEmail: string;
  contactPhone?: string;
  adminIds: string[];
}

export interface Analytics {
  totalReports: number;
  resolvedReports: number;
  avgResolutionTime: number; // in hours
  reportsByCategory: Record<IssueCategory, number>;
  reportsByStatus: Record<IssueStatus, number>;
  reportsByMonth: Record<string, number>;
  departmentStats: Record<string, {
    assigned: number;
    resolved: number;
    avgResolutionTime: number;
  }>;
  heatmapData: Array<{
    lat: number;
    lng: number;
    weight: number;
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
  type: 'status_update' | 'assignment' | 'resolution' | 'general';
}
