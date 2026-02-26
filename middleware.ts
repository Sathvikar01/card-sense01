import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

type RateLimitRule = {
  id: 'ai' | 'cards' | 'upload'
  basePath: string
  limit: number
  limiter: Ratelimit
}

const hasUpstashEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)

const RULES: RateLimitRule[] = hasUpstashEnv
  ? (() => {
      const redis = Redis.fromEnv()
      return [
        {
          id: 'ai',
          basePath: '/api/ai',
          limit: 20,
          limiter: new Ratelimit({
            redis,
            limiter: Ratelimit.fixedWindow(20, '1 h'),
            prefix: 'ratelimit:ai',
            analytics: true,
          }),
        },
        {
          id: 'cards',
          basePath: '/api/cards',
          limit: 100,
          limiter: new Ratelimit({
            redis,
            limiter: Ratelimit.fixedWindow(100, '1 h'),
            prefix: 'ratelimit:cards',
            analytics: true,
          }),
        },
        {
          id: 'upload',
          basePath: '/api/upload',
          limit: 5,
          limiter: new Ratelimit({
            redis,
            limiter: Ratelimit.fixedWindow(5, '1 h'),
            prefix: 'ratelimit:upload',
            analytics: true,
          }),
        },
      ]
    })()
  : []

const isRouteMatch = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`)

const getRateLimitRule = (pathname: string) =>
  RULES.find((rule) => isRouteMatch(pathname, rule.basePath))

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return 'unknown'
}

export async function middleware(request: NextRequest) {
  if (!hasUpstashEnv) {
    return NextResponse.next()
  }

  if (request.method === 'OPTIONS') {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname
  const rule = getRateLimitRule(pathname)

  if (!rule) {
    return NextResponse.next()
  }

  const ip = getClientIp(request)
  const key = `${rule.id}:${ip}`
  const { success, limit, remaining, reset } = await rule.limiter.limit(key)

  const resetEpochSeconds = Math.ceil(reset / 1000)
  const retryAfterSeconds = Math.max(1, resetEpochSeconds - Math.floor(Date.now() / 1000))

  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        path: rule.basePath,
        limit,
        window: '1 hour',
        retry_after_seconds: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(resetEpochSeconds),
        },
      }
    )
  }

  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(resetEpochSeconds))

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
