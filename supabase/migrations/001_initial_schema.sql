-- MindMate Database Schema
-- Initial migration for all core tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    preferred_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'caregiver')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CAREGIVER_CONNECTIONS TABLE
CREATE TABLE caregiver_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    caregiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('primary', 'regular')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, caregiver_id)
);

-- 3. SCHEDULES TABLE
CREATE TABLE schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    recurrence TEXT NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'custom')),
    recurrence_days TEXT[], -- Array of days for custom recurrence
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MEDICATIONS TABLE
CREATE TABLE medications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT,
    instructions TEXT,
    scheduled_time TIME NOT NULL,
    recurrence TEXT NOT NULL DEFAULT 'daily' CHECK (recurrence IN ('none', 'daily', 'weekly', 'custom')),
    recurrence_days TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MEDICATION_LOGS TABLE
CREATE TABLE medication_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reminder_count INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'missed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ACTIVITIES TABLE
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('memory', 'attention', 'reaction', 'visual')),
    description TEXT,
    instructions TEXT,
    difficulty_levels JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ACTIVITY_SESSIONS TABLE
CREATE TABLE activity_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    difficulty_level INTEGER DEFAULT 1,
    total_score DECIMAL(5,2),
    completion_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ACTIVITY_ATTEMPTS TABLE
CREATE TABLE activity_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES activity_sessions(id) ON DELETE CASCADE NOT NULL,
    attempt_number INTEGER NOT NULL,
    accuracy DECIMAL(5,2),
    reaction_time_ms INTEGER,
    items_correct INTEGER DEFAULT 0,
    items_total INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PERFORMANCE_METRICS TABLE
CREATE TABLE performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('memory', 'attention', 'reaction', 'visual')),
    date DATE NOT NULL,
    average_accuracy DECIMAL(5,2),
    average_reaction_time INTEGER,
    sessions_completed INTEGER DEFAULT 0,
    difficulty_level INTEGER DEFAULT 1,
    trend TEXT CHECK (trend IN ('stable', 'improving', 'declining')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, activity_type, date)
);

-- 10. JOURNAL_MEMORIES TABLE
CREATE TABLE journal_memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    photo_url TEXT,
    memory_date DATE,
    mood TEXT CHECK (mood IN ('happy', 'sad', 'neutral', 'excited', 'calm', 'anxious')),
    tags JSONB, -- Array of tags: people, places, activities
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CHECK_INS TABLE
CREATE TABLE check_ins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    mood TEXT NOT NULL CHECK (mood IN ('good', 'okay', 'not_great')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 12. USER_PREFERENCES TABLE
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    interests JSONB DEFAULT '[]'::jsonb,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 13. ACCESSIBILITY_PREFERENCES TABLE
CREATE TABLE accessibility_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    text_size TEXT DEFAULT 'standard' CHECK (text_size IN ('standard', 'large', 'extra_large')),
    high_contrast BOOLEAN DEFAULT FALSE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    motion_preference TEXT DEFAULT 'standard' CHECK (motion_preference IN ('standard', 'reduced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    caregiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('medication_missed', 'activity_completed', 'performance_change', 'schedule_change')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_caregiver_connections_user_id ON caregiver_connections(user_id);
CREATE INDEX idx_caregiver_connections_caregiver_id ON caregiver_connections(caregiver_id);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_scheduled_date ON schedules(scheduled_date);
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX idx_activity_sessions_user_id ON activity_sessions(user_id);
CREATE INDEX idx_activity_attempts_session_id ON activity_attempts(session_id);
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(date);
CREATE INDEX idx_journal_memories_user_id ON journal_memories(user_id);
CREATE INDEX idx_journal_memories_memory_date ON journal_memories(memory_date);
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_date ON check_ins(date);
CREATE INDEX idx_notifications_caregiver_id ON notifications(caregiver_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.accessibility_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caregiver_connections_updated_at BEFORE UPDATE ON caregiver_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_memories_updated_at BEFORE UPDATE ON journal_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accessibility_preferences_updated_at BEFORE UPDATE ON accessibility_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();