-- Simple RLS Policies for MindMate
-- Matches the current schema and focuses on core tables

-- Enable RLS on core tables
ALTER TABLE journal_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- JOURNAL_MEMORIES RLS POLICIES

-- Users can read their own memories
CREATE POLICY "Users can read own memories"
  ON journal_memories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own memories
CREATE POLICY "Users can create own memories"
  ON journal_memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own memories
CREATE POLICY "Users can update own memories"
  ON journal_memories FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own memories
CREATE POLICY "Users can delete own memories"
  ON journal_memories FOR DELETE
  USING (auth.uid() = user_id);

-- SCHEDULES RLS POLICIES

-- Users can read their own schedules
CREATE POLICY "Users can read own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own schedules
CREATE POLICY "Users can create own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedules
CREATE POLICY "Users can update own schedules"
  ON schedules FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own schedules
CREATE POLICY "Users can delete own schedules"
  ON schedules FOR DELETE
  USING (auth.uid() = user_id);

-- MEDICATIONS RLS POLICIES

-- Users can read their own medications
CREATE POLICY "Users can read own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own medications
CREATE POLICY "Users can create own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own medications
CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own medications
CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- MEDICATION_LOGS RLS POLICIES

-- Users can read their own medication logs
CREATE POLICY "Users can read own medication logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own medication logs
CREATE POLICY "Users can create own medication logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ACTIVITY_SESSIONS RLS POLICIES

-- Users can read their own activity sessions
CREATE POLICY "Users can read own activity sessions"
  ON activity_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own activity sessions
CREATE POLICY "Users can create own activity sessions"
  ON activity_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PERFORMANCE_METRICS RLS POLICIES

-- Users can read their own performance metrics
CREATE POLICY "Users can read own performance metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own performance metrics
CREATE POLICY "Users can create own performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own performance metrics
CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  USING (auth.uid() = user_id);