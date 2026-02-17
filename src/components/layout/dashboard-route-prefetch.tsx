'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PREFETCH_ROUTES = [
  '/beginner',
  '/cards',
  '/profile',
]

const isSlowConnection = () => {
  const navigatorWithConnection = navigator as Navigator & {
    connection?: {
      saveData?: boolean
      effectiveType?: string
    }
  }

  const connection = navigatorWithConnection.connection
  if (!connection) {
    return false
  }

  if (connection.saveData) {
    return true
  }

  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
}

export function DashboardRoutePrefetch() {
  const router = useRouter()
  const shouldPrefetch = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (!shouldPrefetch) {
      return
    }
    if (isSlowConnection()) {
      return
    }
    if (document.visibilityState !== 'visible') {
      return
    }

    const prefetchRoutes = () => {
      PREFETCH_ROUTES.forEach((route) => {
        router.prefetch(route)
      })
    }

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (win.requestIdleCallback) {
      const idleId = win.requestIdleCallback(prefetchRoutes, { timeout: 1500 })
      return () => {
        if (win.cancelIdleCallback) {
          win.cancelIdleCallback(idleId)
        }
      }
    }

    const timeoutId = window.setTimeout(prefetchRoutes, 1200)
    return () => window.clearTimeout(timeoutId)
  }, [router, shouldPrefetch])

  return null
}
