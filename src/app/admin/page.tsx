'use client';

import { IndianGovDashboard } from '@/components/admin/IndianGovDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="admin">
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Indian Government Admin Dashboard</h1>
        </div>

        <IndianGovDashboard />
      </div>
    </ProtectedRoute>
  );
}
