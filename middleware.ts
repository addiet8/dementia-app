import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Auth routes - redirect to login page (let client-side handle auth)
  const authPaths = ['/auth/login', '/auth/register', '/auth/forgot-password']
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path))

  // Redirect root to login page
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Redirect protected routes to login if not authenticated
  const protectedPaths = ['/dashboard', '/exercises', '/schedule', '/memories', '/progress', '/profile']
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))
  
  if (isProtectedPath && !user && !isAuthPath) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  })
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}