import { NextRequest } from 'next/server'

const TURNSTILE_ENABLED = /^(1|true|yes|on)$/i.test(process.env.ENABLE_TURNSTILE || '')

type TurnstileSiteVerifyResponse = {
  success: boolean
  action?: string
  'error-codes'?: string[]
}

type TurnstileVerificationResult =
  | { success: true; skipped?: boolean }
  | { success: false; reason: 'misconfigured' | 'missing_token' | 'verification_failed' | 'action_mismatch'; errorCodes?: string[] }

export function isTurnstileEnabled() {
  return TURNSTILE_ENABLED
}

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || undefined
  }

  const realIp = request.headers.get('x-real-ip')
  return realIp || undefined
}

export async function verifyTurnstileToken({
  request,
  token,
  expectedAction,
}: {
  request: NextRequest
  token: string | null | undefined
  expectedAction?: string
}): Promise<TurnstileVerificationResult> {
  if (!TURNSTILE_ENABLED) {
    return { success: true, skipped: true }
  }

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return { success: false, reason: 'misconfigured' }
  }

  if (!token) {
    return { success: false, reason: 'missing_token' }
  }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)

  const clientIp = getClientIp(request)
  if (clientIp) {
    body.set('remoteip', clientIp)
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  })

  if (!response.ok) {
    return { success: false, reason: 'verification_failed' }
  }

  const parsed = (await response.json()) as TurnstileSiteVerifyResponse

  if (!parsed.success) {
    return {
      success: false,
      reason: 'verification_failed',
      errorCodes: parsed['error-codes'] || [],
    }
  }

  if (expectedAction && parsed.action && parsed.action !== expectedAction) {
    return {
      success: false,
      reason: 'action_mismatch',
      errorCodes: parsed['error-codes'] || [],
    }
  }

  return { success: true }
}
