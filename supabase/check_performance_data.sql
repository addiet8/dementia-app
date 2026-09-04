-- Check performance metrics data
-- Run this to see if performance data is being saved

-- Check all performance metrics records
SELECT * FROM performance_metrics ORDER BY created_at DESC LIMIT 10;

-- Check performance metrics by user (replace with actual user_id if needed)
SELECT user_id, activity_type, date, average_accuracy, average_reaction_time, sessions_completed, created_at
FROM performance_metrics 
ORDER BY created_at DESC;

-- Count total performance metrics records
SELECT COUNT(*) as total_records, activity_type 
FROM performance_metrics 
GROUP BY activity_type;

-- Check the most recent records
SELECT 
    user_id,
    activity_type,
    date,
    average_accuracy,
    average_reaction_time,
    sessions_completed,
    difficulty_level,
    trend,
    created_at
FROM performance_metrics 
ORDER BY created_at DESC 
LIMIT 5;