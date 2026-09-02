-- Insert the visual pattern match activity
-- The constraints already support 'visual' category, so we just need to add the activity
INSERT INTO activities (name, category, description, instructions, difficulty_levels) VALUES
('Pattern Match', 'visual',
 'Identify matching patterns and sequences to train visual processing.',
 'Look at the pattern shown and select the matching pattern from the options. Work as quickly and accurately as you can.',
 '[
   {
     "level": 1,
     "pattern_complexity": "simple",
     "option_count": 2,
     "description": "Simple patterns with 2 options"
   },
   {
     "level": 2,
     "pattern_complexity": "simple",
     "option_count": 3,
     "description": "Simple patterns with 3 options"
   },
   {
     "level": 3,
     "pattern_complexity": "moderate",
     "option_count": 3,
     "description": "Moderate patterns with 3 options"
   },
   {
     "level": 4,
     "pattern_complexity": "moderate",
     "option_count": 4,
     "description": "Moderate patterns with 4 options"
   },
   {
     "level": 5,
     "pattern_complexity": "complex",
     "option_count": 4,
     "description": "Complex patterns with 4 options"
   }
 ]'::jsonb);
