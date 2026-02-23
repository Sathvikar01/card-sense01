import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { insertUserInteraction } from '@/lib/interactions/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0
        const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0
        const isSignup = Boolean(createdAt && lastSignInAt && Math.abs(lastSignInAt - createdAt) < 120000)

        await insertUserInteraction({
          supabase,
          userId: user.id,
          eventType: isSignup ? 'auth_signup_success' : 'auth_login_success',
          page: '/auth/callback',
          entityType: 'auth',
          metadata: {
            next,
            provider: user.app_metadata?.provider ?? 'unknown',
          },
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
