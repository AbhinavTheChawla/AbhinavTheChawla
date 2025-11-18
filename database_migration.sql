-- Database Migration Script
-- Run this in your Supabase SQL Editor to add any missing columns
--
-- SAFE TO RE-RUN: This script checks if columns exist before adding them
-- WHEN TO RUN:
--   1. Initial setup (if you have an old database)
--   2. After pulling new features that require new database columns
--   3. Anytime you suspect your database is missing columns
--
-- HOW TO RUN:
--   1. Go to Supabase → SQL Editor
--   2. Create new query
--   3. Paste this entire file
--   4. Click "Run"
--   5. Check the messages - they'll tell you what was added
--
-- Last Updated: 2025-11-18 (includes all columns through this date)

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add food_data column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'food_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN food_data JSONB;
        RAISE NOTICE 'Added food_data column';
    END IF;

    -- Add weight_data column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'weight_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN weight_data JSONB;
        RAISE NOTICE 'Added weight_data column';
    END IF;

    -- Add weekly_tracker column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'weekly_tracker'
    ) THEN
        ALTER TABLE user_data ADD COLUMN weekly_tracker JSONB;
        RAISE NOTICE 'Added weekly_tracker column';
    END IF;

    -- Add daily_reflection column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'daily_reflection'
    ) THEN
        ALTER TABLE user_data ADD COLUMN daily_reflection JSONB;
        RAISE NOTICE 'Added daily_reflection column';
    END IF;

    -- Add todo_notes column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'todo_notes'
    ) THEN
        ALTER TABLE user_data ADD COLUMN todo_notes JSONB;
        RAISE NOTICE 'Added todo_notes column';
    END IF;

    -- Add ai_chat_history column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'ai_chat_history'
    ) THEN
        ALTER TABLE user_data ADD COLUMN ai_chat_history JSONB;
        RAISE NOTICE 'Added ai_chat_history column';
    END IF;

    RAISE NOTICE 'Migration complete - all columns verified/added';
END $$;

-- ============================================================================
-- NOTE FOR DEVELOPERS: When adding new features that require new DB columns
-- ============================================================================
-- 1. Add a new IF NOT EXISTS block above for the new column
-- 2. Update the "Last Updated" date at the top
-- 3. Users can safely re-run this entire script to get the new column
-- ============================================================================
