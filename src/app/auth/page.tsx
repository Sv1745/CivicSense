'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (user.role === 'admin' || user.role === 'department_head') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CivicSense</h1>
          <p className="text-gray-600">
            Making cities better, one report at a time
          </p>
        </div>
        <AuthForm mode={mode} onSwitchMode={() => setMode(mode === 'login' ? 'signup' : 'login')} />
      </div>
    </div>
  );
}