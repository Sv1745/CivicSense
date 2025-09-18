"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';

export function ProfileDebugHelper() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const debugProfileAccess = async () => {
      console.log('🔧 Profile Debug Helper - Starting diagnostics...');

      // Check Supabase connection
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          console.error('❌ Supabase connection error:', error);
        } else {
          console.log('✅ Supabase connection OK');
        }
      } catch (err) {
        console.error('❌ Supabase connection failed:', err);
      }

      // Check authentication
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('🔐 Auth user:', authUser ? authUser.email : 'No auth user');

      // Check profile access
      if (authUser) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (error) {
            console.error('❌ Profile access error:', error);
          } else {
            console.log('✅ Profile access OK:', data);
          }
        } catch (err) {
          console.error('❌ Profile access failed:', err);
        }
      }

      console.log('🔧 Profile Debug Helper - Diagnostics complete');
    };

    if (!loading) {
      debugProfileAccess();
    }
  }, [loading]);

  // This component doesn't render anything visible
  return null;
}