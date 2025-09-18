"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseSeeder } from '@/components/admin/DatabaseSeeder';
import { SupabaseConnectionTest } from '@/components/debug/SupabaseConnectionTest';
import { StorageDiagnostics } from '@/components/debug/StorageDiagnostics';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  Building,
  MapPin,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Eye,
  UserCheck,
  Flag,
  Shield,
  Globe,
  Building2,
  Landmark,
  Truck,
  Zap,
  Droplets,
  TreePine,
  GraduationCap,
  Heart,
  Scale
} from 'lucide-react';
import type { Database } from '@/lib/database.types';
import { issueService, departmentService, categoryService, profileService } from '@/lib/database';
import { StatusBadge } from '@/components/issues/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Issue = Tables['issues']['Row'];
type Category = Tables['categories']['Row'];
type Department = Tables['departments']['Row'];

// Map database status to StatusBadge expected values
const mapStatus = (status: string) => {
  switch (status) {
    case 'submitted': return 'submitted';
    case 'acknowledged': return 'acknowledged';
    case 'in_progress': return 'in_progress';
    case 'resolved': return 'resolved';
    case 'closed': return 'resolved';
    default: return 'submitted';
  }
};

// Comprehensive Indian Government Departments and Civic Bodies
const INDIAN_DEPARTMENTS = [
  // Central Government Ministries
  { 
    name: 'Ministry of Home Affairs', 
    category: 'Law & Order', 
    color: 'bg-red-100 text-red-800',
    icon: Shield,
    description: 'Internal security, police, disaster management'
  },
  { 
    name: 'Ministry of Health & Family Welfare', 
    category: 'Healthcare', 
    color: 'bg-green-100 text-green-800',
    icon: Heart,
    description: 'Public health, medical services, pharmaceuticals'
  },
  { 
    name: 'Ministry of Education', 
    category: 'Education', 
    color: 'bg-blue-100 text-blue-800',
    icon: GraduationCap,
    description: 'Schools, universities, literacy programs'
  },
  { 
    name: 'Ministry of Railways', 
    category: 'Transportation', 
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'Railway infrastructure and operations'
  },
  { 
    name: 'Ministry of Road Transport & Highways', 
    category: 'Infrastructure', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Building2,
    description: 'National highways, road safety, transport policy'
  },
  { 
    name: 'Ministry of Housing & Urban Affairs', 
    category: 'Urban Development', 
    color: 'bg-indigo-100 text-indigo-800',
    icon: Building,
    description: 'Urban planning, housing schemes, smart cities'
  },
  { 
    name: 'Ministry of Rural Development', 
    category: 'Rural Affairs', 
    color: 'bg-orange-100 text-orange-800',
    icon: TreePine,
    description: 'Rural employment, poverty alleviation, infrastructure'
  },
  { 
    name: 'Ministry of Environment & Climate Change', 
    category: 'Environment', 
    color: 'bg-teal-100 text-teal-800',
    icon: Globe,
    description: 'Environmental protection, climate policy, forests'
  },

  // State Level Departments
  { 
    name: 'State Police Department', 
    category: 'Law & Order', 
    color: 'bg-red-100 text-red-800',
    icon: Shield,
    description: 'State law enforcement, crime prevention'
  },
  { 
    name: 'Public Works Department (PWD)', 
    category: 'Infrastructure', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Building2,
    description: 'State infrastructure, building construction, maintenance'
  },
  { 
    name: 'State Transport Corporation', 
    category: 'Transportation', 
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'Public transport, bus services, permits'
  },
  { 
    name: 'Electricity Board', 
    category: 'Utilities', 
    color: 'bg-amber-100 text-amber-800',
    icon: Zap,
    description: 'Power generation, distribution, billing'
  },
  { 
    name: 'Water Supply & Sewerage Board', 
    category: 'Utilities', 
    color: 'bg-blue-100 text-blue-800',
    icon: Droplets,
    description: 'Water supply, sewage treatment, sanitation'
  },
  { 
    name: 'State Health Department', 
    category: 'Healthcare', 
    color: 'bg-green-100 text-green-800',
    icon: Heart,
    description: 'State hospitals, health programs, medical colleges'
  },
  { 
    name: 'Education Department', 
    category: 'Education', 
    color: 'bg-blue-100 text-blue-800',
    icon: GraduationCap,
    description: 'State schools, teacher training, scholarships'
  },
  { 
    name: 'Forest Department', 
    category: 'Environment', 
    color: 'bg-teal-100 text-teal-800',
    icon: TreePine,
    description: 'Forest conservation, wildlife protection'
  },

  // Municipal Bodies
  { 
    name: 'Municipal Corporation', 
    category: 'Civic Services', 
    color: 'bg-gray-100 text-gray-800',
    icon: Landmark,
    description: 'Urban local governance, civic amenities'
  },
  { 
    name: 'Municipal Council', 
    category: 'Civic Services', 
    color: 'bg-gray-100 text-gray-800',
    icon: Building,
    description: 'Small town governance, local services'
  },
  { 
    name: 'Panchayat Raj', 
    category: 'Rural Governance', 
    color: 'bg-orange-100 text-orange-800',
    icon: TreePine,
    description: 'Village governance, rural development'
  },
  { 
    name: 'District Collector Office', 
    category: 'Administration', 
    color: 'bg-pink-100 text-pink-800',
    icon: Scale,
    description: 'District administration, revenue collection'
  },
  { 
    name: 'Tehsildar Office', 
    category: 'Revenue', 
    color: 'bg-cyan-100 text-cyan-800',
    icon: FileText,
    description: 'Land records, revenue administration'
  },

  // Specialized Agencies
  { 
    name: 'Pollution Control Board', 
    category: 'Environment', 
    color: 'bg-teal-100 text-teal-800',
    icon: Globe,
    description: 'Environmental monitoring, pollution control'
  },
  { 
    name: 'Fire Services', 
    category: 'Emergency Services', 
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    description: 'Fire safety, emergency response'
  },
  { 
    name: 'Traffic Police', 
    category: 'Traffic Management', 
    color: 'bg-red-100 text-red-800',
    icon: Shield,
    description: 'Traffic regulation, road safety'
  },
  { 
    name: 'Food & Drug Administration', 
    category: 'Public Safety', 
    color: 'bg-green-100 text-green-800',
    icon: Heart,
    description: 'Food safety, drug regulation'
  },
  { 
    name: 'Labour Department', 
    category: 'Employment', 
    color: 'bg-indigo-100 text-indigo-800',
    icon: Users,
    description: 'Worker welfare, employment schemes'
  }
];

const PRIORITY_LEVELS = [
  { level: 'critical', label: 'Critical', color: 'bg-red-500', count: 0, description: 'Immediate action required' },
  { level: 'high', label: 'High', color: 'bg-orange-500', count: 0, description: 'Urgent resolution needed' },
  { level: 'medium', label: 'Medium', color: 'bg-yellow-500', count: 0, description: 'Standard processing time' },
  { level: 'low', label: 'Low', color: 'bg-green-500', count: 0, description: 'Non-urgent matters' }
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  totalUsers: number;
  departmentStats: Array<{
    department: string;
    count: number;
    resolved: number;
    pending: number;
    category: string;
    color: string;
    icon: React.ComponentType<any>;
    description: string;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    color: string;
  }>;
  stateStats: Array<{
    state: string;
    count: number;
    resolved: number;
  }>;
  recentIssues: Issue[];
  priorityStats: typeof PRIORITY_LEVELS;
  monthlyTrends: Array<{
    month: string;
    issues: number;
    resolved: number;
  }>;
  resolutionRate: number;
  avgResolutionTime: number;
}

export function IndianGovDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    totalUsers: 0,
    departmentStats: [],
    categoryStats: [],
    stateStats: [],
    recentIssues: [],
    priorityStats: PRIORITY_LEVELS,
    monthlyTrends: [],
    resolutionRate: 0,
    avgResolutionTime: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedState, setSelectedState] = useState('all');

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all issues
      const issues = await issueService.getAllIssues();
      const users = await profileService.getAllUsers();
      const departments = await departmentService.getDepartments();
      const categories = await categoryService.getCategories();

      // Calculate basic stats
      const totalIssues = issues.length;
      const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
      const pendingIssues = totalIssues - resolvedIssues;
      const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
      
      // Calculate average resolution time (mock calculation)
      const avgResolutionTime = Math.round(Math.random() * 10) + 5; // 5-15 days

      // Department statistics with enhanced Indian government mapping
      const departmentStats = INDIAN_DEPARTMENTS.map(dept => {
        const deptIssues = issues.filter(i => {
          // Match by department_id if available
          if (i.department_id) {
            const department = departments.find(d => d.id === i.department_id);
            if (department?.name?.toLowerCase().includes(dept.name.toLowerCase())) {
              return true;
            }
          }
          
          // Fallback matching based on category for demo data
          const category = categories.find(c => c.id === i.category_id);
          if (category) {
            const categoryName = category.name?.toLowerCase();
            return (
              (dept.category === 'Infrastructure' && (categoryName.includes('road') || categoryName.includes('water') || categoryName.includes('electricity'))) ||
              (dept.category === 'Healthcare' && categoryName.includes('health')) ||
              (dept.category === 'Education' && categoryName.includes('education')) ||
              (dept.category === 'Environment' && (categoryName.includes('environment') || categoryName.includes('pollution'))) ||
              (dept.category === 'Law & Order' && categoryName.includes('safety')) ||
              (dept.category === 'Transportation' && categoryName.includes('transport')) ||
              (dept.category === 'Utilities' && (categoryName.includes('water') || categoryName.includes('electricity')))
            );
          }
          
          return false;
        });
        
        return {
          department: dept.name,
          count: deptIssues.length,
          resolved: deptIssues.filter(i => i.status === 'resolved').length,
          pending: deptIssues.filter(i => i.status !== 'resolved').length,
          category: dept.category,
          color: dept.color,
          icon: dept.icon,
          description: dept.description
        };
      }).filter(stat => stat.count > 0);

      // Category statistics
      const categoryStats = categories.map(cat => ({
        category: cat.name,
        count: issues.filter(i => i.category_id === cat.id).length,
        color: `bg-${['blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'red', 'orange'][Math.floor(Math.random() * 8)]}-100`
      }));

      // State statistics (mock data for comprehensive view)
      const stateStats = INDIAN_STATES.slice(0, 10).map(state => ({
        state,
        count: Math.floor(Math.random() * 50) + 5,
        resolved: Math.floor(Math.random() * 30) + 2
      })).sort((a, b) => b.count - a.count);

      // Priority statistics
      const priorityStats = PRIORITY_LEVELS.map(priority => ({
        ...priority,
        count: issues.filter(i => i.priority === priority.level).length
      }));

      // Monthly trends (last 6 months)
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthIssues = issues.filter(issue => {
          const issueDate = new Date(issue.created_at);
          return issueDate >= monthStart && issueDate <= monthEnd;
        });
        
        return {
          month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
          issues: monthIssues.length,
          resolved: monthIssues.filter(i => i.status === 'resolved').length
        };
      }).reverse();

      // Recent issues (last 10)
      const recentIssues = [...issues]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setStats({
        totalIssues,
        pendingIssues,
        resolvedIssues,
        totalUsers: users.length,
        departmentStats,
        categoryStats,
        stateStats,
        recentIssues,
        priorityStats,
        monthlyTrends,
        resolutionRate,
        avgResolutionTime
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, color = "text-blue-600", subtitle }: {
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    trend?: number;
    color?: string;
    subtitle?: string;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {trend > 0 ? '+' : ''}{trend}% from last month
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-gradient-to-r ${color.includes('blue') ? 'from-blue-100 to-blue-200' : 
            color.includes('orange') ? 'from-orange-100 to-orange-200' :
            color.includes('green') ? 'from-green-100 to-green-200' :
            'from-purple-100 to-purple-200'}`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Flag className="w-8 h-8 text-orange-500 animate-pulse mr-2" />
            <Shield className="w-8 h-8 text-green-600 animate-pulse mr-2" />
            <Building className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">भारत सरकार</h2>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Government of India</h3>
          <p className="text-gray-600">Loading comprehensive civic oversight dashboard...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header with Indian Government Branding */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Flag className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">भारत सरकार</h1>
                  <h2 className="text-xl font-semibold">Government of India</h2>
                  <p className="text-orange-100 mt-1">Digital India - Civic Engagement Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Civic Issues"
            value={stats.totalIssues.toLocaleString('en-IN')}
            icon={FileText}
            trend={12}
            color="text-blue-600"
            subtitle="Reported by citizens"
          />
          <StatCard
            title="Pending Resolution"
            value={stats.pendingIssues.toLocaleString('en-IN')}
            icon={Clock}
            trend={-5}
            color="text-orange-600"
            subtitle="Awaiting action"
          />
          <StatCard
            title="Successfully Resolved"
            value={stats.resolvedIssues.toLocaleString('en-IN')}
            icon={CheckCircle}
            trend={18}
            color="text-green-600"
            subtitle={`${stats.resolutionRate}% success rate`}
          />
          <StatCard
            title="Active Citizens"
            value={stats.totalUsers.toLocaleString('en-IN')}
            icon={Users}
            trend={8}
            color="text-purple-600"
            subtitle="Registered users"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Monthly Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-lg">{trend.month}</p>
                      <p className="text-sm text-gray-600">Issues: {trend.issues} | Resolved: {trend.resolved}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${trend.issues > 0 ? (trend.resolved / trend.issues) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-sm mt-1">{trend.issues > 0 ? Math.round((trend.resolved / trend.issues) * 100) : 0}% resolved</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.priorityStats.map((priority) => (
                  <div key={priority.level} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${priority.color} rounded-full`} />
                      <div>
                        <p className="font-semibold capitalize">{priority.label}</p>
                        <p className="text-xs text-gray-600">{priority.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100">
                      {priority.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="departments">Government Departments</TabsTrigger>
            <TabsTrigger value="states">State Performance</TabsTrigger>
            <TabsTrigger value="categories">Issue Categories</TabsTrigger>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="setup">Database Setup</TabsTrigger>
          </TabsList>

          {/* Indian Government Departments */}
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-600" />
                  Indian Government Departments Performance
                </CardTitle>
                <p className="text-gray-600 mt-2">Comprehensive oversight across central, state, and local government bodies</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {stats.departmentStats.map((dept, index) => {
                    const IconComponent = dept.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-full bg-blue-50">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{dept.department}</p>
                            <Badge className={dept.color} variant="secondary">
                              {dept.category}
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-800">{dept.count}</p>
                          <div className="flex space-x-4 text-sm mt-2">
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded">✓ {dept.resolved} resolved</span>
                            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">⏱ {dept.pending} pending</span>
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-2 bg-green-500 rounded-full transition-all duration-300"
                              style={{ width: `clamp(0%, ${dept.count > 0 ? (dept.resolved / dept.count) * 100 : 0}%, 100%)` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stats.departmentStats.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold mb-2">No Department Data Available</h3>
                      <p className="text-gray-600">Issue reports will be categorized by government departments once submitted.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* State Performance */}
          <TabsContent value="states" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  State-wise Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.stateStats.map((state, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-lg">{state.state}</p>
                        <Badge variant="outline" className="bg-white">
                          {state.count} issues
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">{state.resolved} resolved</span>
                        <span className="text-orange-600">{state.count - state.resolved} pending</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ width: `clamp(0%, ${(state.resolved / state.count) * 100}%, 100%)` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issue Categories */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Civic Issue Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stats.categoryStats.map((cat, index) => (
                    <div key={index} className="p-6 border rounded-lg text-center hover:shadow-md transition-shadow bg-white">
                      <div className={`w-16 h-16 ${cat.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                        <span className="font-bold text-2xl text-gray-700">{cat.count}</span>
                      </div>
                      <p className="font-semibold text-lg">{cat.category}</p>
                      <p className="text-sm text-gray-600 mt-1">Active Issues</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Issues */}
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Citizen Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                      <div className="flex-1">
                        <p className="font-semibold text-lg mb-2">{issue.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
                            <MapPin className="w-4 h-4 mr-1" />
                            {issue.latitude && issue.longitude 
                              ? `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}` 
                              : 'Location not specified'}
                          </span>
                          <span className="flex items-center bg-blue-50 px-2 py-1 rounded">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(issue.created_at).toLocaleDateString('en-IN')}
                          </span>
                          <span className="flex items-center bg-green-50 px-2 py-1 rounded">
                            <UserCheck className="w-4 h-4 mr-1" />
                            Anonymous Citizen
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={mapStatus(issue.status)} />
                        <Button variant="outline" size="sm" className="hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {stats.recentIssues.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold mb-2">No Recent Issues</h3>
                      <p className="text-gray-600">Citizen reports will appear here once submitted through the platform.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Resolution Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Overall Resolution Rate</span>
                      <span className="text-2xl font-bold text-green-600">{stats.resolutionRate}%</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full">
                      <div 
                        className="h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${stats.resolutionRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-gray-600">Average Resolution Time</span>
                      <span className="text-2xl font-bold text-blue-600">{stats.avgResolutionTime} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Citizen Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-purple-600">{stats.totalUsers.toLocaleString('en-IN')}</p>
                      <p className="text-gray-600">Active Citizens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.totalIssues.toLocaleString('en-IN')}</p>
                      <p className="text-gray-600">Total Reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            {/* Connection Test */}
            <SupabaseConnectionTest />
            
            {/* Storage Diagnostics */}
            <StorageDiagnostics />
            
            {/* Database Seeding */}
            <Card>
              <CardHeader>
                <CardTitle>Database Setup</CardTitle>
                <CardDescription>
                  Initialize your database with Indian government departments and categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseSeeder />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Government of India Footer */}
        <Card className="bg-gradient-to-r from-orange-500 to-green-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <Flag className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">डिजिटल इंडिया • Digital India</h3>
                <p className="text-orange-100">Transforming India through Technology</p>
              </div>
              <Shield className="w-8 h-8" />
            </div>
            <p className="text-white/90 max-w-3xl mx-auto leading-relaxed">
              Empowering every citizen to participate in governance through transparent, efficient, and accessible digital platforms. 
              Together, we build a stronger, more responsive democracy.
            </p>
            <div className="mt-6 flex justify-center space-x-8 text-sm text-white/80">
              <span>🏛️ Government of India</span>
              <span>💻 Ministry of Electronics & IT</span>
              <span>🇮🇳 Made in India</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}