import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import useStore from '../store';
import { syncService } from '../services/syncService';
import { isSupabaseConfigured } from '../config/supabase.config';

const SyncSettings = ({ isOpen, onClose }) => {
  const supabaseUrl = useStore((state) => state.supabaseUrl);
  const supabaseAnonKey = useStore((state) => state.supabaseAnonKey);
  const userId = useStore((state) => state.userId);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);
  const updateBlueprint = useStore((state) => state.updateBlueprint);

  const [syncStatus, setSyncStatus] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && userId);
  const isAutoConfigured = isSupabaseConfigured();

  const handleSync = async () => {
    if (!isConfigured) {
      setSyncStatus('error');
      setSyncMessage('Supabase not configured. Please set up credentials in .env file.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage('Syncing data...');

    try {
      const result = await syncService.fullSync(userId);

      if (result.success) {
        if (result.hasChanges) {
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
    if (!isConfigured) {
      setSyncStatus('error');
      setSyncMessage('Supabase not configured. Please set up credentials in .env file.');
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
    if (!isConfigured) {
      setSyncStatus('error');
      setSyncMessage('Supabase not configured. Please set up credentials in .env file.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage('Downloading data...');

    try {
      const result = await syncService.downloadData(userId);

      if (result.success) {
        if (result.hasChanges) {
          reloadFromStorage();
          setSyncStatus('success');
          setSyncMessage('✅ Download completed! Data updated.');
        } else {
          setSyncStatus('success');
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

  const handleClearBlueprint = () => {
    try {
      // Clear from localStorage
      localStorage.removeItem('blueprintData');

      // Reset to empty blueprint in store
      updateBlueprint({
        dailyMantra: '',
        dailyMantraDate: '',
        dailyIntentions: '',
        weeklyIntentions: '',
        todoContent: '',
        lifeNow: {
          training: '',
          reading: '',
          sports: '',
          practices: [],
          dailyGoals: []
        },
        lifeNextYear: {
          career: '',
          reading: '',
          training: '',
          activities: '',
          travel: ''
        }
      });

      setSyncStatus('success');
      setSyncMessage('✅ Blueprint data cleared successfully!');
      setShowClearConfirm(false);
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`❌ Failed to clear blueprint data: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Cloud className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Cloud Sync</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Status Card */}
        <div className={`rounded-lg p-4 mb-6 border-2 ${
          isConfigured
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {isConfigured ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <AlertCircle className="text-yellow-600" size={24} />
            )}
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">
                {isConfigured ? '✅ Sync Configured' : '⚠️ Sync Not Configured'}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {isConfigured
                  ? `Syncing as user: ${userId}`
                  : 'Sync is not configured. Add credentials to .env file.'
                }
              </p>
            </div>
          </div>

          {isAutoConfigured && (
            <div className="flex items-start gap-2 bg-white/50 rounded p-2 text-xs">
              <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">
                Auto-configured from environment variables. All devices will sync automatically.
              </span>
            </div>
          )}
        </div>

        {/* Setup Instructions (only show if not configured) */}
        {!isConfigured && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-3 text-sm">Quick Setup:</h4>
            <ol className="text-xs text-blue-800 space-y-2 list-decimal list-inside">
              <li>
                Create a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Supabase</a> account (free)
              </li>
              <li>Create a new project</li>
              <li>Go to Settings → API and copy your URL and anon key</li>
              <li>
                Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root with:
                <pre className="bg-slate-900 text-green-400 p-2 rounded mt-1 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_USER_ID=my_user_id`}
                </pre>
              </li>
              <li>Run the database setup SQL (see below)</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        )}

        {/* Database Schema */}
        <details className="mb-6 bg-slate-50 rounded-lg p-4">
          <summary className="font-semibold text-slate-700 cursor-pointer text-sm flex items-center gap-2">
            📋 Database Setup SQL
          </summary>
          <div className="mt-3">
            <p className="text-xs text-slate-600 mb-2">
              Run this in your Supabase SQL Editor (one time setup):
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
  daily_reflection JSONB,
  weekly_tracker JSONB,
  weight_data JSONB,
  food_data JSONB,
  todo_notes JSONB,
  ai_chat_history JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_data_user_id ON user_data(user_id);
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON user_data FOR ALL USING (true);`}
            </pre>
          </div>
        </details>

        {/* Sync Controls */}
        {isConfigured && (
          <>
            <div className="space-y-3 mb-6">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                Full Sync (Download + Upload)
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleUpload}
                  disabled={isSyncing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Cloud size={16} />
                  Upload to Cloud
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isSyncing}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <CloudOff size={16} />
                  Download from Cloud
                </button>
              </div>
            </div>

            {/* Status Message */}
            {syncMessage && (
              <div className={`rounded-lg p-3 text-sm ${
                syncStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                syncStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {syncMessage}
              </div>
            )}
          </>
        )}

        {/* Data Management Section */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-700 mb-3 text-sm flex items-center gap-2">
            <Trash2 size={16} className="text-red-500" />
            Data Management
          </h4>

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 border border-red-300"
            >
              <Trash2 size={16} />
              Clear Blueprint Data
            </button>
          ) : (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold mb-3">
                ⚠️ Are you sure? This will permanently delete all blueprint data.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearBlueprint}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Yes, Clear Data
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            {isConfigured
              ? '💡 Changes are automatically synced every 2 seconds when you make edits'
              : '💡 Once configured, all your devices will sync automatically'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SyncSettings;
