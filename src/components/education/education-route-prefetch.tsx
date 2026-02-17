'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface EducationRoutePrefetchProps {
  slugs: string[]
}

const shouldSkipPrefetch = () => {
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

export function EducationRoutePrefetch({ slugs }: EducationRoutePrefetchProps) {
  const router = useRouter()

  useEffect(() => {
    if (!slugs.length || shouldSkipPrefetch()) {
      return
    }

    const prefetch = () => {
      slugs.forEach((slug) => router.prefetch(`/education/${slug}`))
    }

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (win.requestIdleCallback) {
      const idleId = win.requestIdleCallback(prefetch, { timeout: 1500 })
      return () => {
        if (win.cancelIdleCallback) {
          win.cancelIdleCallback(idleId)
        }
      }
    }

    const timeoutId = window.setTimeout(prefetch, 300)
    return () => window.clearTimeout(timeoutId)
  }, [router, slugs])

  return null
}
