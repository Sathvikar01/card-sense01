// Middleware helper for Supabase session management
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

const buildLoginRedirectUrl = (request: NextRequest) => {
  const loginUrl = new URL('/login', request.url)
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
  if (nextPath && nextPath !== '/login') {
    loginUrl.searchParams.set('next', nextPath)
  }
  return loginUrl
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let user: unknown = null
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      })

      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      user = null
    }
  }

  const configuredE2EBypassKey = process.env.CARDSENSE_E2E_BYPASS_KEY
  const isE2ERequest =
    Boolean(configuredE2EBypassKey) &&
    request.headers.get('x-cardsense-e2e') === configuredE2EBypassKey

  if (isE2ERequest) {
    return response
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = [
    '/dashboard',
    '/beginner',
    '/advisor',
    '/spending',
    '/profile',
    '/recommendations',
    '/cards',
    '/education',
    '/chat',
  ]
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    return NextResponse.redirect(buildLoginRedirectUrl(request))
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
