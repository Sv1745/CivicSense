// Test Supabase Connection
// Run this in your browser console to verify the connection

import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check connection
    const { data: connection, error: connError } = await supabase
      .from('categories')
      .select('count(*)')
      .limit(1);
    
    if (connError) {
      console.error('❌ Connection failed:', connError.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('❌ Categories fetch failed:', catError.message);
      return false;
    }
    
    console.log(`✅ Found ${categories?.length || 0} categories:`, categories);
    
    // Test 3: Check real-time
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'issues'
      }, (payload) => {
        console.log('🔄 Real-time event received:', payload);
      })
      .subscribe((status) => {
        console.log('🔄 Real-time subscription status:', status);
      });
    
    console.log('✅ Real-time subscription created');
    
    // Test 4: Check auth
    const { data: user } = await supabase.auth.getUser();
    console.log('👤 Current user:', user.user?.email || 'Not authenticated');
    
    console.log('🎉 All tests passed! Your Supabase is configured correctly.');
    
    // Cleanup
    setTimeout(() => {
      channel.unsubscribe();
    }, 5000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  testSupabaseConnection();
}