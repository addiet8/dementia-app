import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client using @supabase/ssr for proper cookie handling
// In Next.js 16, each component call gets its own instance, which is the recommended pattern
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createBrowserClient(url, key)
}