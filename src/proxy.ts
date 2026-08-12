import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default async function proxy(request: NextRequest) {
  const rateLimitResult = await enforceRateLimit(request)
  if (rateLimitResult instanceof Response) return rateLimitResult

  const response = await updateSession(request)
  if (rateLimitResult?.headers) {
    for (const [key, value] of Object.entries(rateLimitResult.headers)) {
      response.headers.set(key, value)
    }
  }
  return response
}
