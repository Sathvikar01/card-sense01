import path from 'path'
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN)
const isDevelopment = process.env.NODE_ENV === 'development'

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isDevelopment
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
]

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module:
          /@opentelemetry\/instrumentation\/build\/esm\/platform\/node\/instrumentation\.js/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ]

    return config
  },
}

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  telemetry: false,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: {
    create: hasSentryAuthToken,
    finalize: hasSentryAuthToken,
  },
  sourcemaps: {
    disable: !hasSentryAuthToken,
  },
  webpack: {
    disableSentryConfig: !hasSentryAuthToken,
  },
})
