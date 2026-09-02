# Database Setup Instructions

The application requires database tables to be set up in your Supabase project. Follow these steps:

## Quick Setup

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** (under the "Database" section)
3. Copy the entire contents of `supabase/schema.sql` file
4. Paste it into the SQL Editor
5. Click **Run** to execute the schema

## Storage Setup

You also need to create a storage bucket for memory photos:

1. Go to **Storage** section in Supabase
2. Click **Create a new bucket**
3. Name it: `memory-photos`
4. Make it **Public** (so photos can be displayed)
5. Add the following RLS policy:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memory-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to read photos
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'memory-photos');
```

## Verification

After running the schema, you should see these tables in your Supabase database:
- profiles
- user_preferences
- accessibility_preferences
- caregiver_connections
- schedules
- medications
- medication_logs
- activities
- activity_sessions
- activity_attempts
- performance_metrics
- journal_memories
- check_ins
- notifications

## Troubleshooting

If you see "table does not exist" errors:
1. Make sure you ran the entire schema.sql file
2. Check the Supabase logs for any SQL errors
3. Verify you're in the correct Supabase project

If photo upload fails:
1. Make sure the `memory-photos` bucket exists
2. Verify the bucket is public
3. Check that RLS policies are set up correctly

## Need Help?

If you encounter issues, check the Supabase dashboard logs for detailed error messages.