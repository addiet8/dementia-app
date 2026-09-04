-- Fix Database Schema Issues
-- Run this in your Supabase SQL Editor to fix missing columns and add reaction activity

-- First, fix activities table columns
DO $$
BEGIN
    -- Add instructions column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'instructions'
    ) THEN
        ALTER TABLE activities ADD COLUMN instructions TEXT;
    END IF;
    
    -- Add difficulty_levels column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' AND column_name = 'difficulty_levels'
    ) THEN
        ALTER TABLE activities ADD COLUMN difficulty_levels JSONB;
    END IF;
END $$;

-- Now insert the reaction activity
INSERT INTO activities (name, category, description, instructions, difficulty_levels) VALUES
('Simple Reaction Time', 'reaction',
 'Measure your reaction time by tapping as quickly as possible when you see a signal.',
 'Wait for the signal to appear. When you see it, tap as quickly as you can! You will do several trials to get an average reaction time.',
 '[
   {
     "level": 1,
     "trial_count": 5,
     "min_delay": 2,
     "max_delay": 4,
     "description": "5 trials with 2-4 second delay"
   },
   {
     "level": 2,
     "trial_count": 6,
     "min_delay": 2,
     "max_delay": 5,
     "description": "6 trials with 2-5 second delay"
   },
   {
     "level": 3,
     "trial_count": 7,
     "min_delay": 1.5,
     "max_delay": 5,
     "description": "7 trials with 1.5-5 second delay"
   },
   {
     "level": 4,
     "trial_count": 8,
     "min_delay": 1.5,
     "max_delay": 6,
     "description": "8 trials with 1.5-6 second delay"
   },
   {
     "level": 5,
     "trial_count": 10,
     "min_delay": 1,
     "max_delay": 6,
     "description": "10 trials with 1-6 second delay"
   }
 ]'::jsonb);

-- Fix performance_metrics table columns
DO $$
BEGIN
    -- Add average_accuracy column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'average_accuracy'
    ) THEN
        ALTER TABLE performance_metrics ADD COLUMN average_accuracy DECIMAL(5,2);
    END IF;
    
    -- Add average_reaction_time column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'average_reaction_time'
    ) THEN
        ALTER TABLE performance_metrics ADD COLUMN average_reaction_time INTEGER;
    END IF;
    
    -- Add sessions_completed column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'sessions_completed'
    ) THEN
        ALTER TABLE performance_metrics ADD COLUMN sessions_completed INTEGER DEFAULT 0;
    END IF;
    
    -- Add difficulty_level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'difficulty_level'
    ) THEN
        ALTER TABLE performance_metrics ADD COLUMN difficulty_level INTEGER DEFAULT 1;
    END IF;
    
    -- Add trend column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'trend'
    ) THEN
        ALTER TABLE performance_metrics ADD COLUMN trend TEXT CHECK (trend IN ('stable', 'improving', 'declining'));
    END IF;
    
    -- Check if the column is named 'category' instead of 'activity_type'
    -- If 'category' exists, rename it to 'activity_type' to match the schema
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'category'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'activity_type'
    ) THEN
        ALTER TABLE performance_metrics RENAME COLUMN category TO activity_type;
    END IF;
    
    -- If neither exists, add activity_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'activity_type'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'category'
    ) THEN
        ALTER TABLE performance_metrics ADD COLUMN activity_type TEXT CHECK (activity_type IN ('memory', 'attention', 'reaction', 'visual'));
    END IF;
END $$;
