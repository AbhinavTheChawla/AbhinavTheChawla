import { getSupabase } from './supabaseClient';

/**
 * Sync service for managing data synchronization with Supabase
 *
 * Database Schema (to be created in Supabase):
 *
 * CREATE TABLE user_data (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id TEXT UNIQUE NOT NULL,
 *   wardrobe_categories JSONB,
 *   wardrobe_data JSONB,
 *   wardrobe_wishlist JSONB,
 *   wardrobe_brand_urls JSONB,
 *   wardrobe_wishlist_urls JSONB,
 *   wardrobe_image_urls JSONB,
 *   grooming_data JSONB,
 *   blueprint_data JSONB,
 *   todo_notes JSONB,
 *   ai_chat_history JSONB,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_user_data_user_id ON user_data(user_id);
 *
 * -- Enable Row Level Security
 * ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
 *
 * -- Create policy to allow all operations (since we're using user_id as identifier)
 * CREATE POLICY "Allow all operations" ON user_data FOR ALL USING (true);
 */

class SyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }

  /**
   * Upload all local data to Supabase
   */
  async uploadData(userId) {
    if (!userId) {
      throw new Error('User ID is required for syncing');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    this.syncInProgress = true;

    try {
      // Gather all data from localStorage
      const data = {
        user_id: userId,
        wardrobe_categories: JSON.parse(localStorage.getItem('wardrobe_categories') || 'null'),
        wardrobe_data: JSON.parse(localStorage.getItem('wardrobe_data') || 'null'),
        wardrobe_wishlist: JSON.parse(localStorage.getItem('wardrobe_wishlist') || 'null'),
        wardrobe_brand_urls: JSON.parse(localStorage.getItem('wardrobe_brand_urls') || 'null'),
        wardrobe_wishlist_urls: JSON.parse(localStorage.getItem('wardrobe_wishlist_urls') || 'null'),
        wardrobe_image_urls: JSON.parse(localStorage.getItem('wardrobe_image_urls') || 'null'),
        grooming_data: JSON.parse(localStorage.getItem('groomingData') || 'null'),
        blueprint_data: JSON.parse(localStorage.getItem('blueprintData') || 'null'),
        todo_notes: JSON.parse(localStorage.getItem('todo_notes') || 'null'),
        ai_chat_history: JSON.parse(localStorage.getItem('ai_chat_history') || 'null'),
        updated_at: new Date().toISOString()
      };

      // Upsert data (insert or update if exists)
      const { error } = await supabase
        .from('user_data')
        .upsert(data, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      this.lastSyncTime = new Date();
      console.log('✅ Data uploaded successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Download data from Supabase and merge with local data
   */
  async downloadData(userId) {
    if (!userId) {
      throw new Error('User ID is required for syncing');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    this.syncInProgress = true;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, this is the first sync
          console.log('No remote data found, will upload local data');
          return { success: true, firstSync: true };
        }
        throw error;
      }

      if (data) {
        // Update localStorage with remote data
        if (data.wardrobe_categories) localStorage.setItem('wardrobe_categories', JSON.stringify(data.wardrobe_categories));
        if (data.wardrobe_data) localStorage.setItem('wardrobe_data', JSON.stringify(data.wardrobe_data));
        if (data.wardrobe_wishlist) localStorage.setItem('wardrobe_wishlist', JSON.stringify(data.wardrobe_wishlist));
        if (data.wardrobe_brand_urls) localStorage.setItem('wardrobe_brand_urls', JSON.stringify(data.wardrobe_brand_urls));
        if (data.wardrobe_wishlist_urls) localStorage.setItem('wardrobe_wishlist_urls', JSON.stringify(data.wardrobe_wishlist_urls));
        if (data.wardrobe_image_urls) localStorage.setItem('wardrobe_image_urls', JSON.stringify(data.wardrobe_image_urls));
        if (data.grooming_data) localStorage.setItem('groomingData', JSON.stringify(data.grooming_data));
        if (data.blueprint_data) localStorage.setItem('blueprintData', JSON.stringify(data.blueprint_data));
        if (data.todo_notes) localStorage.setItem('todo_notes', JSON.stringify(data.todo_notes));
        if (data.ai_chat_history) localStorage.setItem('ai_chat_history', JSON.stringify(data.ai_chat_history));

        this.lastSyncTime = new Date();
        console.log('✅ Data downloaded successfully');
        return { success: true, requiresReload: true };
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform a full sync (download then upload to ensure consistency)
   */
  async fullSync(userId) {
    try {
      // First download to get latest data
      const downloadResult = await this.downloadData(userId);

      // If it's the first sync or download succeeded, upload current data
      if (downloadResult.firstSync || downloadResult.success) {
        await this.uploadData(userId);
      }

      return { success: true, requiresReload: downloadResult.requiresReload };
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing() {
    return this.syncInProgress;
  }

  /**
   * Get the last sync time
   */
  getLastSyncTime() {
    return this.lastSyncTime;
  }
}

export const syncService = new SyncService();
