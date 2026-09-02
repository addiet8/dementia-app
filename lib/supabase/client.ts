import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client using @supabase/ssr for proper cookie handling
// In Next.js 16, each component call gets its own instance, which is the recommended pattern
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}