-- Row Level Security Policies for MindMate
-- Run this in Supabase SQL Editor after schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Caregivers can view profiles of connected users
CREATE POLICY "Caregivers can view connected user profiles"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Accessibility preferences policies
CREATE POLICY "Users can view own accessibility preferences"
  ON accessibility_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accessibility preferences"
  ON accessibility_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accessibility preferences"
  ON accessibility_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Caregiver connections policies
CREATE POLICY "Users can view own connections"
  ON caregiver_connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = caregiver_id);

CREATE POLICY "Users can create connections as user"
  ON caregiver_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Caregivers can accept connections"
  ON caregiver_connections FOR UPDATE
  USING (auth.uid() = caregiver_id);

CREATE POLICY "Users can delete own connections"
  ON caregiver_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Schedules policies
CREATE POLICY "Users can view own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can update own schedules"
  ON schedules FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete own schedules"
  ON schedules FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- Caregivers can view connected user schedules
CREATE POLICY "Caregivers can view connected user schedules"
  ON schedules FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- Primary caregivers can manage connected user schedules
CREATE POLICY "Primary caregivers can manage connected user schedules"
  ON schedules FOR ALL
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted' AND role = 'primary'
    )
  );

-- Medications policies
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Caregivers can view connected user medications
CREATE POLICY "Caregivers can view connected user medications"
  ON medications FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- Primary caregivers can manage connected user medications
CREATE POLICY "Primary caregivers can manage connected user medications"
  ON medications FOR ALL
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted' AND role = 'primary'
    )
  );

-- Medication logs policies
CREATE POLICY "Users can view own medication logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication logs"
  ON medication_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can view connected user medication logs
CREATE POLICY "Caregivers can view connected user medication logs"
  ON medication_logs FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- Activities policies (public read, no user-specific data)
CREATE POLICY "Public can view activities"
  ON activities FOR SELECT
  USING (true);

-- Activity sessions policies
CREATE POLICY "Users can view own activity sessions"
  ON activity_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity sessions"
  ON activity_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity sessions"
  ON activity_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can view connected user activity sessions
CREATE POLICY "Caregivers can view connected user activity sessions"
  ON activity_sessions FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- Activity attempts policies
CREATE POLICY "Users can view own activity attempts"
  ON activity_attempts FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM activity_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own activity attempts"
  ON activity_attempts FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM activity_sessions WHERE user_id = auth.uid()
    )
  );

-- Performance metrics policies
CREATE POLICY "Users can view own performance metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can view connected user performance metrics
CREATE POLICY "Caregivers can view connected user performance metrics"
  ON performance_metrics FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- Journal memories policies
CREATE POLICY "Users can view own memories"
  ON journal_memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON journal_memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON journal_memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON journal_memories FOR DELETE
  USING (auth.uid() = user_id);

-- Caregivers can view connected user memories
CREATE POLICY "Caregivers can view connected user memories"
  ON journal_memories FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- Check-ins policies
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON check_ins FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can view connected user check-ins
CREATE POLICY "Caregivers can view connected user check-ins"
  ON check_ins FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM caregiver_connections 
      WHERE caregiver_id = auth.uid() AND status = 'accepted'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications for users
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);