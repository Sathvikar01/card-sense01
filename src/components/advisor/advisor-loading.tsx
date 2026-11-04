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
    <p role="status" className="animate-pulse py-32 text-center text-muted-foreground">
      {STAGES[stage]}…
    </p>
  )
}
