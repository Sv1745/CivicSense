'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'citizen' | 'admin' | 'department_head';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredRole,
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && user && user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin' || user.role === 'department_head') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      return;
    }
  }, [user, loading, router, requireAuth, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect via useEffect
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}