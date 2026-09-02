-- Add INSERT and UPDATE policies for performance_metrics
-- This allows users to save their exercise performance data

-- Users can insert their own performance metrics
CREATE POLICY "Users can insert own performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own performance metrics
CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  USING (auth.uid() = user_id);
