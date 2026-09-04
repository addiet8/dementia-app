-- Simple Diagnostic - Run each query separately

-- Query 1: Check activities table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities'
ORDER BY ordinal_position;

-- Query 2: Check performance_metrics table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'performance_metrics'
ORDER BY ordinal_position;

-- Query 3: Check if reaction activity exists
SELECT * FROM activities WHERE category = 'reaction';

-- Query 4: Check existing performance metrics
SELECT * FROM performance_metrics LIMIT 5;