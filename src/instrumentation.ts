import * as Sentry from '@sentry/nextjs'

const serverDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
const serverEnvironment =
  process.env.VERCEL_ENV ||
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  process.env.NODE_ENV

export function register() {
  if (!serverDsn) {
    return
  }

  Sentry.init({
    dsn: serverDsn,
    tracesSampleRate: 0.05,
    environment: serverEnvironment,
    enabled: true,
  })
}

export const onRequestError = Sentry.captureRequestError

