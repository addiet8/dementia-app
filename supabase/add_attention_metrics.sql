-- Add attention performance metrics manually for testing
-- This simulates what would happen when someone plays the attention exercise

INSERT INTO performance_metrics (user_id, activity_type, date, average_accuracy, average_reaction_time, sessions_completed, difficulty_level, trend)
VALUES 
('a5e805c0-b1aa-47b0-80a1-e25cd4a1607d', 'attention', '2026-09-03', 75.0, 1200, 1, 4, 'stable')
ON CONFLICT (user_id, activity_type, date) 
DO UPDATE SET 
  average_accuracy = EXCLUDED.average_accuracy,
  average_reaction_time = EXCLUDED.average_reaction_time,
  sessions_completed = EXCLUDED.sessions_completed;