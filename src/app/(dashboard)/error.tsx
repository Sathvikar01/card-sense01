'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="text-base font-medium">Something went wrong</p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
