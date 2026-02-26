import * as Sentry from '@sentry/nextjs'

const clientDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
const clientEnvironment =
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  process.env.VERCEL_ENV ||
  process.env.NODE_ENV

Sentry.init({
  dsn: clientDsn,
  tracesSampleRate: 0.05,
  environment: clientEnvironment,
  enabled: Boolean(clientDsn),
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
