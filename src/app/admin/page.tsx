'use client';

import { useState } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { IndianGovDashboard } from '@/components/admin/IndianGovDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  const [view, setView] = useState<'main' | 'gov'>('main');

  return (
    <ProtectedRoute requireAuth={true} requiredRole="admin">
      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setView('main')}
            className={`px-3 py-1 rounded border ${view === 'main' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}>
            Dashboard
          </button>
          <button
            onClick={() => setView('gov')}
            className={`px-3 py-1 rounded border ${view === 'gov' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}>
            IndianGov
          </button>
        </div>

        {view === 'main' ? <AdminDashboard /> : <IndianGovDashboard />}
      </div>
    </ProtectedRoute>
  );
}
