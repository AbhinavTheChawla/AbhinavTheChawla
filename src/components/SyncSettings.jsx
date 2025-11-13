import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import useStore from '../store';
import { initializeSupabase } from '../services/supabaseClient';
import { syncService } from '../services/syncService';

const SyncSettings = ({ isOpen, onClose }) => {
  const supabaseUrl = useStore((state) => state.supabaseUrl);
  const supabaseAnonKey = useStore((state) => state.supabaseAnonKey);
  const userId = useStore((state) => state.userId);
  const updateSupabaseSettings = useStore((state) => state.updateSupabaseSettings);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  const [tempUrl, setTempUrl] = useState('');
  const [tempAnonKey, setTempAnonKey] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempUrl(supabaseUrl);
      setTempAnonKey(supabaseAnonKey);
      setTempUserId(userId || `user_${Date.now()}`);
    }
  }, [isOpen, supabaseUrl, supabaseAnonKey, userId]);

  const handleSave = () => {
    if (!tempUrl || !tempAnonKey || !tempUserId) {
      setSyncStatus('error');
      setSyncMessage('Please fill in all fields');
      return;
    }

    updateSupabaseSettings(tempUrl, tempAnonKey, tempUserId);
    initializeSupabase(tempUrl, tempAnonKey);
    setSyncStatus('success');
    setSyncMessage('Settings saved! You can now sync your data.');
  };

  const handleSync = async () => {
    if (!supabaseUrl || !supabaseAnonKey || !userId) {
      setSyncStatus('error');
      setSyncMessage('Please configure Supabase settings first');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage('Syncing data...');

    try {
      const result = await syncService.fullSync(userId);

      if (result.success) {
        if (result.hasChanges) {
          // Reload state from localStorage instead of refreshing the page
          reloadFromStorage();
          setSyncStatus('success');
          setSyncMessage('✅ Sync completed! Data updated.');
        } else {
          setSyncStatus('success');
          setSyncMessage('✅ Sync completed! Already up to date.');
        }
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`❌ Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async () => {
    if (!supabaseUrl || !supabaseAnonKey || !userId) {
      setSyncStatus('error');
      setSyncMessage('Please configure Supabase settings first');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage('Uploading data...');

    try {
      await syncService.uploadData(userId);
      setSyncStatus('success');
      setSyncMessage('✅ Data uploaded successfully!');
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownload = async () => {
    if (!supabaseUrl || !supabaseAnonKey || !userId) {
      setSyncStatus('error');
      setSyncMessage('Please configure Supabase settings first');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage('Downloading data...');

    try {
      const result = await syncService.downloadData(userId);

      if (result.success) {
        setSyncStatus('success');
        if (result.firstSync) {
          setSyncMessage('No remote data found. Use "Upload" to backup your local data.');
        } else if (result.hasChanges) {
          // Reload state from localStorage instead of refreshing the page
          reloadFromStorage();
          setSyncMessage('✅ Download completed! Data updated.');
        } else {
          setSyncMessage('✅ Download completed! Already up to date.');
        }
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`❌ Download failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Cloud className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Cloud Sync Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">How to set up sync:</h4>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create a free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
            <li>Create a new project</li>
            <li>Go to Settings → API to find your URL and anon key</li>
            <li>In SQL Editor, run the schema from the setup guide below</li>
            <li>Enter your credentials here and click Save</li>
          </ol>
        </div>

        {/* Database Schema */}
        <details className="mb-6 bg-slate-50 rounded-lg p-4">
          <summary className="font-semibold text-slate-700 cursor-pointer text-sm">
            📋 Database Setup Guide (Click to expand)
          </summary>
          <div className="mt-3">
            <p className="text-xs text-slate-600 mb-2">
              Run this SQL in your Supabase SQL Editor:
            </p>
            <pre className="bg-slate-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`CREATE TABLE user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  wardrobe_categories JSONB,
  wardrobe_data JSONB,
  wardrobe_wishlist JSONB,
  wardrobe_brand_urls JSONB,
  wardrobe_wishlist_urls JSONB,
  wardrobe_image_urls JSONB,
  grooming_data JSONB,
  blueprint_data JSONB,
  todo_notes JSONB,
  ai_chat_history JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_data_user_id ON user_data(user_id);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON user_data
  FOR ALL USING (true);`}
            </pre>
          </div>
        </details>

        {/* Settings Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Supabase URL
            </label>
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Supabase Anon Key
            </label>
            <div className="relative">
              <input
                type={showAnonKey ? 'text' : 'password'}
                value={tempAnonKey}
                onChange={(e) => setTempAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowAnonKey(!showAnonKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showAnonKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              User ID (Keep the same across devices)
            </label>
            <input
              type="text"
              value={tempUserId}
              onChange={(e) => setTempUserId(e.target.value)}
              placeholder="user_12345"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use the same User ID on all your devices to sync data between them
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm"
          >
            Save Settings
          </button>
        </div>

        {/* Sync Actions */}
        {supabaseUrl && supabaseAnonKey && userId && (
          <div className="border-t border-slate-200 pt-6">
            <h4 className="font-semibold text-slate-700 mb-4 text-sm">Sync Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                Full Sync
              </button>
              <button
                onClick={handleUpload}
                disabled={isSyncing}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <Cloud size={16} />
                Upload
              </button>
              <button
                onClick={handleDownload}
                disabled={isSyncing}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <CloudOff size={16} />
                Download
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
              <p><strong>Full Sync:</strong> Downloads then uploads (recommended for keeping data in sync)</p>
              <p><strong>Upload:</strong> Push local data to cloud</p>
              <p><strong>Download:</strong> Pull cloud data to this device</p>
            </div>
          </div>
        )}

        {/* Status Message */}
        {syncMessage && (
          <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            syncStatus === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : syncStatus === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {syncStatus === 'success' ? (
              <CheckCircle size={16} />
            ) : syncStatus === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <RefreshCw size={16} className="animate-spin" />
            )}
            {syncMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncSettings;
