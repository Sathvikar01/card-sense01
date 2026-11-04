'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="flex flex-col items-start gap-3 py-16">
      <p>Unable to load this page. Check your connection and try again.</p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
