-- MindMate RLS (Row Level Security) Policies
-- Security policies to ensure users only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS POLICIES

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Caregivers can read profiles of connected users
CREATE POLICY "Caregivers can read connected user profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = profiles.id 
      AND status = 'active'
    )
  );

-- CAREGIVER_CONNECTIONS RLS POLICIES

-- Users can read their own connections
CREATE POLICY "Users can read own connections"
  ON caregiver_connections FOR SELECT
  USING (auth.uid() = user_id);

-- Caregivers can read their connections
CREATE POLICY "Caregivers can read own connections"
  ON caregiver_connections FOR SELECT
  USING (auth.uid() = caregiver_id);

-- Users can create connection invitations
CREATE POLICY "Users can create connections"
  ON caregiver_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Caregivers can accept/reject invitations
CREATE POLICY "Caregivers can update connections"
  ON caregiver_connections FOR UPDATE
  USING (auth.uid() = caregiver_id);

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

-- Caregivers can read connected user schedules
CREATE POLICY "Caregivers can read connected user schedules"
  ON schedules FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = schedules.user_id 
      AND status = 'active'
    )
  );

-- Caregivers can create schedules for connected users
CREATE POLICY "Caregivers can create schedules for connected users"
  ON schedules FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = user_id 
      AND status = 'active'
    )
  );

-- Caregivers can update schedules for connected users
CREATE POLICY "Caregivers can update schedules for connected users"
  ON schedules FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = schedules.user_id 
      AND status = 'active'
    )
  );

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

-- Caregivers can read connected user medications
CREATE POLICY "Caregivers can read connected user medications"
  ON medications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = medications.user_id 
      AND status = 'active'
    )
  );

-- Caregivers can create medications for connected users
CREATE POLICY "Caregivers can create medications for connected users"
  ON medications FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = user_id 
      AND status = 'active'
    )
  );

-- Caregivers can update medications for connected users
CREATE POLICY "Caregivers can update medications for connected users"
  ON medications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = medications.user_id 
      AND status = 'active'
    )
  );

-- MEDICATION_LOGS RLS POLICIES

-- Users can read their own medication logs
CREATE POLICY "Users can read own medication logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own medication logs
CREATE POLICY "Users can create own medication logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Medication logs are immutable (no update/delete policies)

-- Caregivers can read connected user medication logs
CREATE POLICY "Caregivers can read connected user medication logs"
  ON medication_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = medication_logs.user_id 
      AND status = 'active'
    )
  );

-- ACTIVITIES RLS POLICIES

-- Public read access for activity definitions
CREATE POLICY "Public can read activities"
  ON activities FOR SELECT
  USING (true);

-- No insert/update/delete policies - activities managed by admin only

-- ACTIVITY_SESSIONS RLS POLICIES

-- Users can read their own activity sessions
CREATE POLICY "Users can read own activity sessions"
  ON activity_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own activity sessions
CREATE POLICY "Users can create own activity sessions"
  ON activity_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity sessions (for completion status)
CREATE POLICY "Users can update own activity sessions"
  ON activity_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can read connected user activity sessions
CREATE POLICY "Caregivers can read connected user activity sessions"
  ON activity_sessions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = activity_sessions.user_id 
      AND status = 'active'
    )
  );

-- ACTIVITY_ATTEMPTS RLS POLICIES

-- Users can read their own activity attempts
CREATE POLICY "Users can read own activity attempts"
  ON activity_attempts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM activity_sessions 
      WHERE id = activity_attempts.session_id
    )
  );

-- Users can create their own activity attempts
CREATE POLICY "Users can create own activity attempts"
  ON activity_attempts FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM activity_sessions 
      WHERE id = session_id
    )
  );

-- Activity attempts are immutable (no update/delete policies)

-- Caregivers can read connected user activity attempts
CREATE POLICY "Caregivers can read connected user activity attempts"
  ON activity_attempts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id IN (
        SELECT user_id 
        FROM activity_sessions 
        WHERE id = activity_attempts.session_id
      )
      AND status = 'active'
    )
  );

-- PERFORMANCE_METRICS RLS POLICIES

-- Users can read their own performance metrics
CREATE POLICY "Users can read own performance metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own performance metrics
CREATE POLICY "Users can insert own performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own performance metrics
CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can read connected user performance metrics
CREATE POLICY "Caregivers can read connected user performance metrics"
  ON performance_metrics FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = performance_metrics.user_id 
      AND status = 'active'
    )
  );

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

-- Caregivers can read connected user memories
CREATE POLICY "Caregivers can read connected user memories"
  ON journal_memories FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = journal_memories.user_id 
      AND status = 'active'
    )
  );

-- CHECK_INS RLS POLICIES

-- Users can read their own check-ins
CREATE POLICY "Users can read own check_ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own check-ins
CREATE POLICY "Users can create own check_ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own check-ins
CREATE POLICY "Users can update own check_ins"
  ON check_ins FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can read connected user check-ins
CREATE POLICY "Caregivers can read connected user check_ins"
  ON check_ins FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = check_ins.user_id 
      AND status = 'active'
    )
  );

-- USER_PREFERENCES RLS POLICIES

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can read connected user preferences
CREATE POLICY "Caregivers can read connected user preferences"
  ON user_preferences FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = user_preferences.user_id 
      AND status = 'active'
    )
  );

-- ACCESSIBILITY_PREFERENCES RLS POLICIES

-- Users can read their own accessibility preferences
CREATE POLICY "Users can read own accessibility preferences"
  ON accessibility_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own accessibility preferences
CREATE POLICY "Users can update own accessibility preferences"
  ON accessibility_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Caregivers can read connected user accessibility preferences
CREATE POLICY "Caregivers can read connected user accessibility preferences"
  ON accessibility_preferences FOR SELECT
  USING (
    auth.uid() IN (
      SELECT caregiver_id 
      FROM caregiver_connections 
      WHERE user_id = accessibility_preferences.user_id 
      AND status = 'active'
    )
  );

-- NOTIFICATIONS RLS POLICIES

-- Caregivers can read their own notifications
CREATE POLICY "Caregivers can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = caregiver_id);

-- Caregivers can update their own notifications (mark as read)
CREATE POLICY "Caregivers can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = caregiver_id);

-- System can create notifications (no RLS needed for insert, handled by service role)
-- Users cannot access notifications (no policies for users)