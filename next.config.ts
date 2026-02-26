import path from 'path'
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN)

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
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
