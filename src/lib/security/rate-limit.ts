import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { NextRequest, NextResponse } from 'next/server'

type RuleId = 'upload' | 'ai' | 'signup' | 'education' | 'cards' | 'account'

type RuleDefinition = {
  id: RuleId
  paths: string[]
  limit: number
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`
  sensitive?: boolean
}

const RULES: RuleDefinition[] = [
  {
    id: 'upload',
    paths: ['/api/spending/upload', '/api/upload', '/api/analyze-statement'],
    limit: 5,
    window: '1 h',
    sensitive: true,
  },
  { id: 'ai', paths: ['/api/ai'], limit: 20, window: '1 h', sensitive: true },
  { id: 'signup', paths: ['/api/auth/signup'], limit: 10, window: '1 h', sensitive: true },
  { id: 'account', paths: ['/api/account'], limit: 20, window: '1 h', sensitive: true },
  { id: 'education', paths: ['/api/education/view'], limit: 60, window: '1 h' },
  { id: 'cards', paths: ['/api/cards'], limit: 100, window: '1 h' },
]

const hasRedisConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)

const redis = hasRedisConfig ? Redis.fromEnv() : null
const limiters = new Map<RuleId, Ratelimit>()
const localCounters = new Map<string, { count: number; resetAt: number }>()

const matchesPath = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`)

const getRule = (pathname: string) =>
  RULES.find((rule) => rule.paths.some((path) => matchesPath(pathname, path)))

const getTrustedClientIp = (request: NextRequest) => {
  if (process.env.VERCEL) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  }

  if (request.headers.has('cf-ray')) {
    return request.headers.get('cf-connecting-ip')?.trim() || 'unknown'
  }

  if (/^(1|true|yes|on)$/i.test(process.env.TRUST_PROXY_IP_HEADERS || '')) {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip')?.trim() ||
      'unknown'
    )
  }

  return process.env.NODE_ENV === 'development' ? 'local-development' : 'unknown'
}

const isE2ERequest = (request: NextRequest) => {
  const bypassKey = process.env.CARDSENSE_E2E_BYPASS_KEY
  return Boolean(bypassKey) && request.headers.get('x-cardsense-e2e') === bypassKey
}

export async function enforceRateLimit(request: NextRequest) {
  if (request.method === 'OPTIONS' || isE2ERequest(request)) return null

  const rule = getRule(request.nextUrl.pathname)
  if (!rule) return null

  if (!redis) {
    // Recommendations and other app features are deterministic and must not
    // become unavailable just because an optional Redis limiter is missing.
    // Keep a small best-effort per-instance limit instead of blocking requests.
    const key = `${rule.id}:${getTrustedClientIp(request)}`
    const now = Date.now()
    const existing = localCounters.get(key)
    const resetAt = existing && existing.resetAt > now ? existing.resetAt : now + 60 * 60 * 1000
    const count = existing && existing.resetAt > now ? existing.count + 1 : 1

    if (count > rule.limit) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfterSeconds: Math.ceil((resetAt - now) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - now) / 1000)) } }
      )
    }

    localCounters.set(key, { count, resetAt })
    return null
  }

  let limiter = limiters.get(rule.id)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(rule.limit, rule.window),
      prefix: `ratelimit:${rule.id}`,
      analytics: true,
    })
    limiters.set(rule.id, limiter)
  }

  try {
    const ip = getTrustedClientIp(request)
    const result = await limiter.limit(`${rule.id}:${ip}`)
    const resetSeconds = Math.ceil(result.reset / 1000)
    const retryAfter = Math.max(1, resetSeconds - Math.floor(Date.now() / 1000))
    const headers = {
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(resetSeconds),
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', retryAfterSeconds: retryAfter },
        { status: 429, headers: { ...headers, 'Retry-After': String(retryAfter) } }
      )
    }

    return { headers }
  } catch {
    // Redis is an abuse-control enhancement, not a dependency of the engine.
    // Fail open so a transient limiter outage cannot break recommendations.
    return null
  }
}
