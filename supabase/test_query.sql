-- Test the exact query that the React app is making
-- This will help us identify why the query returns 0 records

-- Test 1: Get current date in the same format the app uses
SELECT 
  CURRENT_DATE as today,
  (CURRENT_DATE - INTERVAL '1 day') as yesterday,
  CURRENT_DATE as date_start;

-- Test 2: Check the actual data type of average_accuracy
SELECT 
  user_id,
  activity_type, 
  date,
  average_accuracy,
  pg_typeof(average_accuracy) as accuracy_type,
  average_reaction_time,
  pg_typeof(average_reaction_time) as reaction_time_type
FROM performance_metrics 
WHERE user_id = 'a5e805c0-b1aa-47b0-80a1-e25cd4a1607d';

-- Test 3: Simulate the exact query the app makes
SELECT *
FROM performance_metrics 
WHERE user_id = 'a5e805c0-b1aa-47b0-80a1-e25cd4a1607d'
AND date >= '2026-09-02'
ORDER BY date ASC;

-- Test 4: Try with today's date specifically
SELECT *
FROM performance_metrics 
WHERE user_id = 'a5e805c0-b1aa-47b0-80a1-e25cd4a1607d'
AND date >= '2026-09-03'
ORDER BY date ASC;