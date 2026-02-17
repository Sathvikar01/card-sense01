'use client'

import { useEffect } from 'react'

interface ArticleViewTrackerProps {
  slug: string
}

export function ArticleViewTracker({ slug }: ArticleViewTrackerProps) {
  useEffect(() => {
    const controller = new AbortController()

    const trackView = async () => {
      try {
        await fetch('/api/education/view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug }),
          keepalive: true,
          signal: controller.signal,
        })
      } catch {
        // View tracking is non-blocking; ignore failures.
      }
    }

    trackView()

    return () => {
      controller.abort()
    }
  }, [slug])

  return null
}
