import * as Sentry from '@sentry/nextjs'
import { type NextRequest, NextResponse } from 'next/server'

type ApiRouteHandler<TContext = unknown> = (
  request: NextRequest,
  context: TContext
) => Promise<Response> | Response

interface WrapperOptions {
  fallbackMessage?: string
}

export function withApiErrorCapture<TContext = unknown>(
  handler: ApiRouteHandler<TContext>,
  options: WrapperOptions = {}
) {
  return async (request: NextRequest, context: TContext): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          layer: 'api',
          route: request.nextUrl.pathname,
          method: request.method,
        },
      })

      await Sentry.flush(2000)

      return NextResponse.json(
        { error: options.fallbackMessage || 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
