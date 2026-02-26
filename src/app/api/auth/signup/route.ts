import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstileToken } from '@/lib/security/turnstile'
import { startApiRequestLog } from '@/lib/logging/api-logger'

const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  fullName: z.string().trim().min(2).max(100).optional(),
  turnstileToken: z.string().min(1).optional(),
  redirectToPath: z.string().startsWith('/').optional(),
})

const LOCALHOST_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

const parseOrigin = (value?: string | null) => {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

const isLocalOrigin = (origin: string) => {
  try {
    const { hostname } = new URL(origin)
    return LOCALHOST_HOSTS.has(hostname.toLowerCase())
  } catch {
    return false
  }
}

const resolveCallbackOrigin = (request: NextRequest) => {
  const requestOrigin = request.nextUrl.origin
  const envOrigin =
    parseOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    parseOrigin(process.env.NEXT_PUBLIC_SITE_URL)

  if (!envOrigin) return requestOrigin

  if (!isLocalOrigin(requestOrigin) && isLocalOrigin(envOrigin)) {
    return requestOrigin
  }

  return envOrigin
}

export async function POST(request: NextRequest) {
  const requestLog = startApiRequestLog(request, {
    route: '/api/auth/signup',
  })

  const respond = (
    body: Record<string, unknown>,
    status: number,
    params: { userId?: string | null; error?: unknown; metadata?: Record<string, unknown> } = {}
  ) => {
    requestLog.complete({
      status,
      userId: params.userId ?? null,
      error: params.error,
      metadata: params.metadata,
    })
    return NextResponse.json(body, { status })
  }

  try {
    const raw = await request.json()
    const parsed = signupRequestSchema.safeParse(raw)
    if (!parsed.success) {
      return respond(
        { error: 'Invalid signup payload' },
        400,
        { metadata: { reason: 'invalid_payload' } }
      )
    }

    const { email, password, fullName, turnstileToken, redirectToPath } = parsed.data
    const turnstileResult = await verifyTurnstileToken({
      request,
      token: turnstileToken,
      expectedAction: 'signup',
    })

    if (!turnstileResult.success) {
      const status = turnstileResult.reason === 'misconfigured' ? 500 : 403
      return respond(
        { error: status === 500 ? 'Security check is not configured' : 'Security verification failed' },
        status,
        { metadata: { reason: 'turnstile_failed', turnstileReason: turnstileResult.reason } }
      )
    }

    const supabase = await createClient()
    const callbackOrigin = resolveCallbackOrigin(request)

    const emailRedirectTo = redirectToPath
      ? `${callbackOrigin}/auth/callback?next=${encodeURIComponent(redirectToPath)}`
      : `${callbackOrigin}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...(fullName ? { full_name: fullName } : {}),
        },
        emailRedirectTo,
      },
    })

    if (error) {
      return respond(
        { error: error.message },
        400,
        { metadata: { reason: 'supabase_signup_failed' } }
      )
    }

    return respond(
      { success: true },
      200,
      { userId: data.user?.id ?? null, metadata: { outcome: 'signup_submitted' } }
    )
  } catch (error) {
    return respond(
      { error: 'Unexpected signup error' },
      500,
      { error, metadata: { reason: 'exception' } }
    )
  }
}
