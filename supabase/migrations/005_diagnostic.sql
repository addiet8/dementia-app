-- Diagnostic query to check actual table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('activities', 'performance_metrics')
ORDER BY table_name, ordinal_position;

-- Check existing constraints
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conrelid::regclass IN ('activities', 'performance_metrics')
AND contype = 'c';
