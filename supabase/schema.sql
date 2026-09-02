-- MindMate Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  preferred_name TEXT,
  role TEXT CHECK (role IN ('user', 'caregiver')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Accessibility preferences
CREATE TABLE IF NOT EXISTS accessibility_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text_size TEXT CHECK (text_size IN ('standard', 'large', 'extra_large')) DEFAULT 'standard',
  high_contrast BOOLEAN DEFAULT false,
  sound_enabled BOOLEAN DEFAULT true,
  motion_preference TEXT CHECK (motion_preference IN ('standard', 'reduced')) DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Caregiver connections
CREATE TABLE IF NOT EXISTS caregiver_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('primary', 'regular')),
  status TEXT CHECK (status IN ('pending', 'active', 'removed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, caregiver_id)
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reminder BOOLEAN DEFAULT false,
  reminder_minutes_before INTEGER DEFAULT 15,
  recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'selected_days')) DEFAULT 'none',
  recurrence_days TEXT[],
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Medication logs
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken BOOLEAN DEFAULT false,
  taken_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Activities (exercise types)
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('memory', 'attention', 'reaction', 'visual')) NOT NULL,
  description TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10) DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Activity sessions
CREATE TABLE IF NOT EXISTS activity_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
  completed BOOLEAN DEFAULT false
);

-- Activity attempts (individual trials within a session)
CREATE TABLE IF NOT EXISTS activity_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES activity_sessions(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  accuracy DECIMAL(5,2),
  reaction_time_ms INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Performance metrics (aggregated data)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('memory', 'attention', 'reaction', 'visual')) NOT NULL,
  date DATE NOT NULL,
  avg_accuracy DECIMAL(5,2),
  avg_reaction_time_ms INTEGER,
  total_attempts INTEGER,
  completed_sessions INTEGER,
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, category, date)
);

-- Journal memories
CREATE TABLE IF NOT EXISTS journal_memories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  photo_url TEXT,
  mood TEXT CHECK (mood IN ('happy', 'neutral', 'sad', 'anxious', 'excited', 'calm')),
  tags TEXT[],
  memory_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Daily check-ins
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT CHECK (mood IN ('good', 'okay', 'not_great')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  caregiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('medication_missed', 'activity_completed', 'performance_change', 'caregiver_request', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_scheduled_time ON medication_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_id ON activity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_memories_user_id ON journal_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_caregiver_id ON notifications(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  -- Create default preferences
  INSERT INTO user_preferences (user_id, interests)
  VALUES (NEW.id, ARRAY[]::TEXT[]);
  
  -- Create default accessibility preferences
  INSERT INTO accessibility_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accessibility_preferences_updated_at ON accessibility_preferences;
CREATE TRIGGER update_accessibility_preferences_updated_at BEFORE UPDATE ON accessibility_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_caregiver_connections_updated_at ON caregiver_connections;
CREATE TRIGGER update_caregiver_connections_updated_at BEFORE UPDATE ON caregiver_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_memories_updated_at ON journal_memories;
CREATE TRIGGER update_journal_memories_updated_at BEFORE UPDATE ON journal_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();