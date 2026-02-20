'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Beginner flow is now part of the unified advisor.
// Redirect users who land here.
export default function BeginnerPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/advisor')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-2">
        <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Redirecting to the advisor...</p>
      </div>
    </div>
  )
}
