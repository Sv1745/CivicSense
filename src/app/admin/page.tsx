'use client';

import { IndianGovDashboard } from "@/components/admin/IndianGovDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="admin">
      <IndianGovDashboard />
    </ProtectedRoute>
  );
}
