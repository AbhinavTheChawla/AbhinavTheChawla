/**
 * Supabase Configuration
 *
 * Add your Supabase credentials here for automatic sync across all devices.
 * You can find these values in your Supabase project settings:
 * - Project URL: https://app.supabase.com/project/YOUR_PROJECT/settings/api
 * - Anon Key: https://app.supabase.com/project/YOUR_PROJECT/settings/api
 *
 * Once configured here, sync will work automatically on all devices without
 * needing to enter credentials manually.
 */

export const SUPABASE_CONFIG = {
  // Your Supabase project URL
  url: import.meta.env.VITE_SUPABASE_URL || '',

  // Your Supabase anon/public key (safe to expose in frontend)
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // Default user ID (you can customize this or leave it as is)
  // All devices using the same userId will sync together
  defaultUserId: import.meta.env.VITE_USER_ID || 'default_user',
};

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
};
