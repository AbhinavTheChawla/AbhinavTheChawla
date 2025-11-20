-- Database Migration Script
-- Run this in your Supabase SQL Editor to add any missing columns
-- This script is safe to run multiple times - it only adds columns if they don't exist

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

    -- Add media_data column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'media_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN media_data JSONB;
        RAISE NOTICE 'Added media_data column';
    END IF;

    RAISE NOTICE 'Migration complete - all columns verified/added';
END $$;
