'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import { offlineModeService } from '@/lib/offline-mode';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Check if we're in demo mode (no valid Supabase config)
const isDemoMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes('your-project-ref') || key.includes('your-anon-key');
};

// Test Supabase connection
const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.warn('⚠️ Supabase connection failed:', error);
    return false;
  }
};

interface AuthContextType {
  user: Profile | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  isOffline: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // Add signOut as alias for logout
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      // Test connection first
      const connectionWorks = await testConnection();
      
      if (!connectionWorks || isDemoMode()) {
        console.log('🎭 Running in offline/demo mode - Mock authentication active');
        setIsOffline(true);
        offlineModeService.setOnlineStatus(false);
        
        const demoUser: Profile = {
          id: 'demo-user-123',
          email: 'demo@CivicNetra.com',
          full_name: 'Demo User',
          avatar_url: null,
          phone: null,
          address: null,
          city: 'Demo City',
          state: 'Demo State',
          role: 'citizen',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setUser(demoUser);
        setSupabaseUser(null);
        setLoading(false);
        return;
      }

      // Connection works - proceed with real auth
      setIsOffline(false);
      offlineModeService.setOnlineStatus(true);

      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state change:', event, session?.user?.email);

            if (event === 'SIGNED_IN' && session?.user) {
              console.log('✅ User signed in successfully');
              // Show success toast for sign in
              toast({
                title: 'Welcome!',
                description: 'You have been successfully signed in.',
              });
            }

            if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out');
              setUser(null);
              setSupabaseUser(null);
              setLoading(false);
              toast({
                title: 'Signed Out',
                description: 'You have been successfully signed out.',
              });
            }

            setSupabaseUser(session?.user ?? null);

            if (session?.user) {
              await fetchUserProfile(session.user.id);
            } else if (event !== 'SIGNED_OUT') {
              // Only clear user state if it's not already handled by SIGNED_OUT event
              setUser(null);
              setLoading(false);
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        // Fall back to offline mode
        setIsOffline(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);

        if (error.code === 'PGRST116') {
          // Profile doesn't exist, try to create one
          console.log('📝 Profile not found, attempting to create...');
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log('👤 Creating profile for user:', user.email);
              const createdProfile = await createUserProfile(
                user.id,
                user.email || '',
                user.user_metadata?.full_name || user.user_metadata?.name || 'User'
              );
              if (createdProfile) {
                console.log('✅ Profile created successfully');
                setUser(createdProfile as Profile);
                toast({
                  title: 'Profile Created',
                  description: 'Your profile has been set up successfully.',
                });
              } else {
                console.error('❌ Failed to create profile');
              }
              return;
            } else {
              console.error('❌ No authenticated user found');
            }
          } catch (createError) {
            console.error('❌ Failed to create missing profile:', createError);
          }
        } else if (error.code === '42P01') {
          console.error('❌ Profiles table does not exist. Please run the database setup script.');
        } else if (error.code === '42501') {
          console.error('❌ Permission denied. Check RLS policies.');
        }

        setUser(null);
      } else {
        console.log('✅ Profile loaded successfully:', data.email);
        setUser(data);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string, email: string, displayName: string) => {
    // First, let's check if a profile already exists (might have been created by trigger)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      return existingProfile;
    }

    // If no profile exists, try to create one
    const profile: Database['public']['Tables']['profiles']['Insert'] = {
      id: userId,
      email: email,
      full_name: displayName,
      role: 'citizen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use upsert instead of insert to handle conflicts
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error.message || error);
      throw new Error(`Error creating user profile: "${error.message || error}"`);
    }

    return data;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo mode: Sign up simulation');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        }
      }
    });

    if (error) throw error;
    
    if (data.user) {
      console.log('✅ User created successfully:', data.user.id);
      // Profile will be automatically created by the database trigger
      // No manual profile creation needed
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo mode: Sign in simulation');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    if (isDemoMode()) {
      console.log('🎭 Demo mode: Google sign in simulation');
      return;
    }

    // Get the current domain dynamically
    let currentOrigin: string;
    if (typeof window !== 'undefined') {
      currentOrigin = window.location.origin;
    } else {
      // Fallback for server-side rendering
      currentOrigin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_APP_URL || 'https://CivicNetrasih.vercel.app/');
    }

  // Redirect back to root so client-side Supabase can finish the PKCE exchange
  const redirectTo = `${currentOrigin}`;
    console.log('🔗 Google OAuth redirect URL:', redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isDemoMode()) {
        console.log('🎭 Demo mode: Logout simulation');
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
        toast({
          title: 'Signed Out',
          description: 'You have been successfully signed out.',
        });
        return;
      }

      // Clear local state immediately
      setUser(null);
      setSupabaseUser(null);
      setLoading(false);

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error during sign out:', error);
        toast({
          title: 'Sign Out Error',
          description: 'There was an issue signing out. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }

      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Revert local state if sign out failed
      // Note: This might not work perfectly if the session was already cleared
    }
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode()) {
      console.log('🎭 Demo mode: Password reset simulation');
      return;
    }

    // Get the current domain dynamically
    let currentOrigin: string;
    if (typeof window !== 'undefined') {
      currentOrigin = window.location.origin;
    } else {
      // Fallback for server-side rendering
      currentOrigin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${currentOrigin}/auth/reset-password`
    });

    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (isDemoMode()) {
      console.log('🎭 Demo mode: Profile update simulation');
      if (user) {
        setUser({ ...user, ...updates, updated_at: new Date().toISOString() });
      }
      return;
    }

    if (!supabaseUser) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', supabaseUser.id);

    if (error) throw error;

    // Update local state
    if (user) {
      setUser({ ...user, ...updates, updated_at: new Date().toISOString() });
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    isOffline,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    signOut: logout, // Add signOut as alias for logout
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}