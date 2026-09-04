-- Fix the unique constraint naming mismatch
-- The constraint was created with 'category' but the column is now 'activity_type'

-- First, let's check what constraints exist on performance_metrics
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'performance_metrics')
AND contype = 'u';

-- Drop the old constraint with the wrong column name
ALTER TABLE performance_metrics 
DROP CONSTRAINT IF EXISTS performance_metrics_user_id_category_date_key;

-- Add the correct constraint with the right column name
ALTER TABLE performance_metrics 
ADD CONSTRAINT performance_metrics_user_id_activity_type_date_key 
UNIQUE (user_id, activity_type, date);

-- Verify the constraint was created correctly
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'performance_metrics')
AND contype = 'u';