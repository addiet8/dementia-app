-- Clean up duplicate reaction activities
-- Keep only the first one and delete the rest

-- First, let's see all reaction activities with their IDs
SELECT id, name, category, created_at 
FROM activities 
WHERE category = 'reaction' 
ORDER BY created_at;

-- Keep the oldest one (first created) and delete the newer duplicates
DELETE FROM activities 
WHERE id IN (
    SELECT id 
    FROM activities 
    WHERE category = 'reaction' 
    AND id NOT IN (
        SELECT id 
        FROM activities 
        WHERE category = 'reaction' 
        ORDER BY created_at ASC 
        LIMIT 1
    )
);

-- Verify only one remains
SELECT * FROM activities WHERE category = 'reaction';