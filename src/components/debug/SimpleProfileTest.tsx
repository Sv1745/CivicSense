"use client";

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function SimpleProfileTest() {
  const [status, setStatus] = useState('Loading...');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const testProfile = async () => {
      try {
        // Test 1: Check Supabase connection
        setStatus('Testing Supabase connection...');
        const { data: connectionTest, error: connectionError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (connectionError) {
          setStatus(`❌ Connection failed: ${connectionError.message}`);
          console.error('Connection error:', connectionError);
          return;
        }

        setStatus('✅ Connection OK, checking auth...');

        // Test 2: Check authentication
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          setStatus(`❌ Auth error: ${authError.message}`);
          console.error('Auth error:', authError);
          return;
        }

        if (!authUser) {
          setStatus('❌ No authenticated user found');
          return;
        }

        setUser(authUser);
        setStatus('✅ Auth OK, fetching profile...');

        // Test 3: Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          setStatus(`❌ Profile fetch failed: ${profileError.message}`);
          console.error('Profile error:', profileError);
          return;
        }

        setProfile(profileData);
        setStatus('✅ Profile loaded successfully!');

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setStatus(`❌ Unexpected error: ${errorMessage}`);
        console.error('Unexpected error:', err);
      }
    };

    testProfile();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Profile Test Results:</h3>
      <p className="text-sm mb-2">{status}</p>

      {user && (
        <div className="text-xs">
          <p><strong>User:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id.substring(0, 8)}...</p>
        </div>
      )}

      {profile && (
        <div className="text-xs mt-2">
          <p><strong>Profile:</strong> {profile.full_name || 'No name'}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>
      )}
    </div>
  );
}