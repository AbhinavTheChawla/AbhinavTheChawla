import { createClient } from '@supabase/supabase-js';

let supabase = null;

/**
 * Initialize Supabase client with credentials
 */
export const initializeSupabase = (supabaseUrl, supabaseAnonKey) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not provided');
    return null;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
};

/**
 * Get the Supabase client instance
 */
export const getSupabase = () => {
  return supabase;
};

/**
 * Check if Supabase is initialized
 */
export const isSupabaseInitialized = () => {
  return supabase !== null;
};
