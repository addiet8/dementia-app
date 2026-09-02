-- Seed Activities Table with Initial Cognitive Exercises
-- These are the core exercise types for the MVP

-- Memory Exercise: Remember Objects
INSERT INTO activities (name, category, description, instructions, difficulty_levels) VALUES
('Remember Objects', 'memory',
 'Remember a set of objects displayed for a short time, then select which objects you saw.',
 'You will see several objects displayed on the screen. Try to remember them! After they disappear, select the objects you remember seeing.',
 '[
   {
     "level": 1,
     "object_count": 3,
     "display_time": 5,
     "description": "Remember 3 objects for 5 seconds"
   },
   {
     "level": 2,
     "object_count": 4,
     "display_time": 5,
     "description": "Remember 4 objects for 5 seconds"
   },
   {
     "level": 3,
     "object_count": 5,
     "display_time": 4,
     "description": "Remember 5 objects for 4 seconds"
   },
   {
     "level": 4,
     "object_count": 6,
     "display_time": 4,
     "description": "Remember 6 objects for 4 seconds"
   },
   {
     "level": 5,
     "object_count": 7,
     "display_time": 3,
     "description": "Remember 7 objects for 3 seconds"
   }
 ]'::jsonb);

-- Memory Exercise: Image Recall
INSERT INTO activities (name, category, description, instructions, difficulty_levels) VALUES
('Image Recall', 'memory',
 'View a simple scene and answer questions about what you saw.',
 'Look carefully at the image shown. After it disappears, you will be asked questions about what you saw in the scene.',
 '[
   {
     "level": 1,
     "question_count": 2,
     "display_time": 10,
     "description": "Answer 2 questions after viewing for 10 seconds"
   },
   {
     "level": 2,
     "question_count": 3,
     "display_time": 10,
     "description": "Answer 3 questions after viewing for 10 seconds"
   },
   {
     "level": 3,
     "question_count": 3,
     "display_time": 8,
     "description": "Answer 3 questions after viewing for 8 seconds"
   },
   {
     "level": 4,
     "question_count": 4,
     "display_time": 8,
     "description": "Answer 4 questions after viewing for 8 seconds"
   },
   {
     "level": 5,
     "question_count": 4,
     "display_time": 6,
     "description": "Answer 4 questions after viewing for 6 seconds"
   }
 ]'::jsonb);

-- Attention Exercise: Target Identification
INSERT INTO activities (name, category, description, instructions, difficulty_levels) VALUES
('Target Identification', 'attention',
 'Tap all objects that match a specific target while ignoring distractors.',
 'Tap every object that matches the target shown. Ignore the other objects. Work as quickly and accurately as you can.',
 '[
   {
     "level": 1,
     "total_objects": 6,
     "target_count": 3,
     "distractor_types": 2,
     "description": "Find 3 targets among 6 objects with 2 distractor types"
   },
   {
     "level": 2,
     "total_objects": 8,
     "target_count": 4,
     "distractor_types": 2,
     "description": "Find 4 targets among 8 objects with 2 distractor types"
   },
   {
     "level": 3,
     "total_objects": 10,
     "target_count": 5,
     "distractor_types": 3,
     "description": "Find 5 targets among 10 objects with 3 distractor types"
   },
   {
     "level": 4,
     "total_objects": 12,
     "target_count": 6,
     "distractor_types": 3,
     "description": "Find 6 targets among 12 objects with 3 distractor types"
   },
   {
     "level": 5,
     "total_objects": 15,
     "target_count": 7,
     "distractor_types": 4,
     "description": "Find 7 targets among 15 objects with 4 distractor types"
   }
 ]'::jsonb);

-- Reaction Exercise: Simple Reaction Time
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

-- Visual Exercise: Pattern Match
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