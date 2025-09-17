import type { IssueReport } from './types';
import { offlineModeService } from './offline-mode';

// Create mock timestamp helper
const createMockTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor(date.getTime() / 1000);
  const nanoseconds = 0;
  
  return {
    seconds,
    nanoseconds,
    toDate: () => date,
    toMillis: () => date.getTime(),
    isEqual: (other: any) => other && other.seconds === seconds && other.nanoseconds === nanoseconds,
    toJSON: () => ({ seconds, nanoseconds })
  } as any; // Type assertion to bypass strict checking for mock data
};

export const mockIssues: IssueReport[] = [
  {
    id: '1',
    citizenId: 'user-123',
    citizenEmail: 'citizen@example.com',
    title: 'Large pothole on arterial road in Koramangala',
    description: 'There is a large and dangerous pothole on the main road in Koramangala 5th Block. It has already caused damage to vehicles.',
    category: 'road_infrastructure',
    status: 'submitted',
    priority: 'high',
    location: {
      address: 'Koramangala 5th Block, Bengaluru',
      coordinates: {
        lat: 12.9352,
        lng: 77.6245,
      },
      state: 'Karnataka',
      city: 'Bengaluru',
      jurisdiction: 'BBMP'
    },
    department: 'BBMP (Public Works)',
    photos: ['https://picsum.photos/seed/pothole/600/400'],
    createdAt: createMockTimestamp('2024-07-20T10:00:00Z'),
    updatedAt: createMockTimestamp('2024-07-20T10:00:00Z'),
    progressNotes: [],
    votes: 12,
    votedBy: []
  },
  {
    id: '2',
    citizenId: 'user-456',
    citizenEmail: 'citizen2@example.com',
    title: 'Streetlight not working in residential colony',
    description: 'The streetlight near the park in Sector 15, Noida has been out for a week. It is very dark and feels unsafe at night.',
    category: 'street_lighting',
    status: 'acknowledged',
    priority: 'medium',
    location: {
      address: 'Sector 15, Noida',
      coordinates: {
        lat: 28.583,
        lng: 77.315,
      },
      state: 'Uttar Pradesh',
      city: 'Noida',
      jurisdiction: 'Noida Authority'
    },
    department: 'Noida Authority (Electrical)',
    photos: ['https://picsum.photos/seed/streetlight/600/400'],
    createdAt: createMockTimestamp('2024-07-19T15:30:00Z'),
    updatedAt: createMockTimestamp('2024-07-20T09:00:00Z'),
    acknowledgedAt: createMockTimestamp('2024-07-20T09:00:00Z'),
    progressNotes: [],
    votes: 8,
    votedBy: []
  },
  {
    id: '3',
    citizenId: 'user-789',
    citizenEmail: 'citizen3@example.com',
    title: 'Garbage dump not cleared for days',
    description: 'The public garbage collection point at Juhu Circle is overflowing. It is a health hazard and smells terrible.',
    category: 'waste_management',
    status: 'in_progress',
    priority: 'urgent',
    location: {
      address: 'Juhu Circle, Mumbai',
      coordinates: {
        lat: 19.1076,
        lng: 72.8273,
      },
      state: 'Maharashtra',
      city: 'Mumbai',
      jurisdiction: 'BMC'
    },
    department: 'BMC (Waste Management)',
    photos: ['https://picsum.photos/seed/garbage/600/400'],
    createdAt: createMockTimestamp('2024-07-18T11:00:00Z'),
    updatedAt: createMockTimestamp('2024-07-19T14:00:00Z'),
    acknowledgedAt: createMockTimestamp('2024-07-18T15:00:00Z'),
    inProgressAt: createMockTimestamp('2024-07-19T14:00:00Z'),
    progressNotes: [],
    votes: 25,
    votedBy: []
  },
  {
    id: '4',
    citizenId: 'user-101',
    citizenEmail: 'citizen4@example.com',
    title: 'Water logging in residential area',
    description: 'After every rain, this area gets completely waterlogged making it impossible to walk. The drainage system seems to be blocked.',
    category: 'water_supply',
    status: 'resolved',
    priority: 'high',
    location: {
      address: 'Lajpat Nagar, Delhi',
      coordinates: {
        lat: 28.633,
        lng: 77.216,
      },
      state: 'Delhi',
      city: 'New Delhi',
      jurisdiction: 'MCD'
    },
    department: 'MCD (Water & Drainage)',
    photos: ['https://picsum.photos/seed/waterlog/600/400'],
    createdAt: createMockTimestamp('2024-07-15T08:00:00Z'),
    updatedAt: createMockTimestamp('2024-07-16T12:00:00Z'),
    acknowledgedAt: createMockTimestamp('2024-07-15T12:00:00Z'),
    inProgressAt: createMockTimestamp('2024-07-15T16:00:00Z'),
    resolvedAt: createMockTimestamp('2024-07-16T12:00:00Z'),
    progressNotes: [],
    votes: 18,
    votedBy: []
  }
];

// Mock departments for demo purposes
export const mockDepartments = [
  {
    id: 'dept-1',
    name: 'BBMP (Public Works)',
    categories: ['road_infrastructure', 'street_lighting'] as const,
    jurisdictions: ['Bengaluru', 'Karnataka'],
    contactEmail: 'publicworks@bbmp.gov.in',
    contactPhone: '+91-80-22221188',
    adminIds: ['admin-1']
  },
  {
    id: 'dept-2',
    name: 'BMC (Waste Management)',
    categories: ['waste_management', 'water_supply'] as const,
    jurisdictions: ['Mumbai', 'Maharashtra'],
    contactEmail: 'waste@mcgm.gov.in',
    contactPhone: '+91-22-22694725',
    adminIds: ['admin-2']
  },
  {
    id: 'dept-3',
    name: 'MCD (Water & Drainage)',
    categories: ['water_supply', 'waste_management'] as const,
    jurisdictions: ['Delhi', 'New Delhi'],
    contactEmail: 'water@mcd.gov.in',
    contactPhone: '+91-11-23378693',
    adminIds: ['admin-3']
  },
  {
    id: 'dept-4',
    name: 'Noida Authority (Electrical)',
    categories: ['street_lighting', 'electricity'] as const,
    jurisdictions: ['Noida', 'Uttar Pradesh'],
    contactEmail: 'electrical@noidaauthority.com',
    contactPhone: '+91-120-2412166',
    adminIds: ['admin-4']
  }
];

// Export function to get offline mode status
export { offlineModeService };
