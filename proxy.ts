import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll: () => {
          const cookies = req.cookies.getAll()
          return cookies.map(({ name, value }) => ({ name, value }))
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            NextResponse.next({
              request: { headers: req.headers },
            }).cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh auth token
  const { data: { user } } = await supabase.auth.getUser()

  // Auth routes
  const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password']
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Protected routes
  const protectedPaths = [
    '/dashboard',
    '/exercises',
    '/schedule',
    '/memories',
    '/progress',
    '/profile',
    '/caregiver',
    '/chat',
  ]
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
  
  if (isProtectedPath && !user && !isAuthPath) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // If already logged in and visiting auth page, redirect to dashboard
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  })
}

export default proxy

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
