# Cross-Device Sync Setup Guide

This guide will help you set up automatic cross-device synchronization for your Personal Organizer app. Once configured, all your data will automatically sync across your laptop, phone, and any other devices.

## Quick Setup (5 minutes)

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in:
   - Project name: `personal-organizer` (or any name you like)
   - Database password: (generate a strong password)
   - Region: Choose closest to you
4. Click "Create new project" and wait ~2 minutes for it to initialize

### Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string of characters)

### Step 3: Set Up Database

1. In your Supabase project, go to **SQL Editor**
2. Click "+ New query"
3. Copy and paste this SQL code:

```sql
CREATE TABLE user_data (
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
CREATE POLICY "Allow all operations" ON user_data FOR ALL USING (true);
```

4. Click **Run** to execute the SQL

### Step 4: Configure Your App

1. In your project root directory, create a file named `.env`
2. Add these three lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_USER_ID=my_unique_id
```

**Important Notes:**
- Replace the URL and key with values from Step 2
- The `VITE_USER_ID` can be any unique string (e.g., your name, email, or any identifier)
- **All devices must use the SAME .env values to sync together**
- The `.env` file is already in `.gitignore` so it won't be committed

### Step 5: Restart Your App

1. Stop your development server (Ctrl+C)
2. Start it again: `npm start`
3. Open the app and check the sync status in Settings

## How to Sync Multiple Devices

### On Your Laptop:
1. Complete Steps 1-5 above
2. Keep a copy of your `.env` file

### On Your Phone/Other Devices:
1. Copy the **exact same** `.env` file from your laptop
2. Place it in the project root directory
3. Start the app

**That's it!** Both devices will now automatically sync with each other.

## How It Works

- **Auto-save**: Changes are saved to localStorage immediately
- **Auto-upload**: Changes upload to Supabase cloud after 2 seconds
- **Auto-download**: Every 10 seconds, the app checks for changes from other devices
- **Cross-device**: Any device with the same `VITE_USER_ID` will sync together

## Verifying Sync is Working

1. Open the app on one device
2. Click the "Sync Settings" button (gear icon in top right)
3. You should see "✅ Sync Configured"
4. Make a change (e.g., add a grocery item)
5. Wait ~2 seconds, you should see "✅ Saved"
6. On another device, wait ~10 seconds and the change should appear

## Troubleshooting

### Sync not working?

1. **Check .env file exists** in your project root
2. **Verify values** - URL should start with `https://` and key should be a long string
3. **Same VITE_USER_ID** on all devices
4. **Restart the app** after creating/modifying `.env`
5. **Check browser console** for error messages

### Still not syncing?

1. Open Sync Settings
2. Click "Full Sync" to manually trigger sync
3. Check if data appears in your Supabase dashboard:
   - Go to **Table Editor** → **user_data**
   - You should see your data there

## Privacy & Security

- Your Supabase anon key is safe to use in frontend code
- Row Level Security (RLS) is enabled but currently allows all operations
- For better security, you can customize RLS policies in Supabase
- All data is stored in your own Supabase project (not shared with anyone)

## Updating Your Database (If Sync is Partially Working)

If some tabs sync but others don't (e.g., grocery list or meal planner not syncing), your database table might be missing some columns. This happens if you created your database before all features were added.

**To fix this:**

1. Go to your Supabase project → **SQL Editor**
2. Click "+ New query"
3. Copy and paste the contents of `database_migration.sql` from this repository
4. Click **Run**
5. You should see messages like "Added food_data column"
6. Restart your app on all devices

The migration script is safe to run multiple times - it only adds columns that don't exist.

## Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Open an issue on GitHub
- Review your browser's developer console for error messages
