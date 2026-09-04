-- Diagnostic Script - Check Current Database Schema
-- Run this first to see the actual state of your database

-- Check activities table structure
SELECT 
    'activities' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities'
ORDER BY ordinal_position;

-- Check performance_metrics table structure  
SELECT 
    'performance_metrics' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'performance_metrics'
ORDER BY ordinal_position;

-- Check if reaction activity exists
SELECT * FROM activities WHERE category = 'reaction';

-- Check existing performance metrics
SELECT * FROM performance_metrics LIMIT 5;
