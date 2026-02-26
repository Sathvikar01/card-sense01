import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { insertUserInteraction } from '@/lib/interactions/server'

const DEFAULT_REDIRECT_PATH = '/dashboard'
const MAX_EXCHANGE_RETRIES = 2

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizeNextPath = (rawNext: string | null) => {
  if (!rawNext) return DEFAULT_REDIRECT_PATH
  if (!rawNext.startsWith('/')) return DEFAULT_REDIRECT_PATH
  if (rawNext.startsWith('//')) return DEFAULT_REDIRECT_PATH
  return rawNext
}

const isTransientExchangeError = (error: { message?: string; status?: number } | null) => {
  if (!error) return false
  if (typeof error.status === 'number' && error.status >= 500) return true

  const normalized = (error.message || '').toLowerCase()
  if (!normalized) return false

  return (
    normalized.includes('fetch failed') ||
    normalized.includes('network') ||
    normalized.includes('timeout') ||
    normalized.includes('econnreset') ||
    normalized.includes('econnrefused') ||
    normalized.includes('ssl') ||
    normalized.includes('handshake') ||
    normalized.includes('cloudflare') ||
    normalized.includes('525')
  )
}

async function exchangeCodeWithRetry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string
) {
  for (let attempt = 0; attempt <= MAX_EXCHANGE_RETRIES; attempt += 1) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return { success: true as const }
    }

    const isLastAttempt = attempt === MAX_EXCHANGE_RETRIES
    if (!isTransientExchangeError(error) || isLastAttempt) {
      return {
        success: false as const,
        transient: isTransientExchangeError(error),
      }
    }

    await sleep(300 * (attempt + 1))
  }

  return { success: false as const, transient: true as const }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = normalizeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const exchangeResult = await exchangeCodeWithRetry(supabase, code)

    if (exchangeResult.success) {
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

    if (!exchangeResult.transient) {
      return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
    }

    const params = new URLSearchParams({
      error: 'auth-temporary-unavailable',
      next,
    })
    return NextResponse.redirect(`${origin}/login?${params.toString()}`)
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
