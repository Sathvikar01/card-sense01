'use client'

import { useEffect, useState } from 'react'

const STAGES = ['Checking eligibility', 'Estimating rewards', 'Ranking cards']
const STAGE_MS = 2500

export function AdvisorLoading() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), STAGE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div role="status" className="flex flex-col items-center gap-4 py-32">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <p className="text-sm text-muted-foreground">{STAGES[stage]}…</p>
    </div>
  )
}
