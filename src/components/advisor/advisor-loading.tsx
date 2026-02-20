'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const STAGES = [
  'Evaluating your financial profile',
  'Matching eligibility against card requirements',
  'Calculating potential rewards from your spending',
  'Scoring cards on fee efficiency',
  'Ranking by overall fit',
]

export function AdvisorLoading() {
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Spinner */}
      <div className="relative h-16 w-16">
        <svg className="h-16 w-16 animate-spin" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
          <path
            d="M32 4a28 28 0 0124.25 14"
            stroke="url(#loading-gold-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="loading-gold-grad" x1="32" y1="4" x2="56" y2="18">
              <stop offset="0%" stopColor="#b8860b" />
              <stop offset="100%" stopColor="#d4a017" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Title */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Generating your report</h3>
        <p className="text-sm text-muted-foreground">This typically takes 10-15 seconds</p>
      </div>

      {/* Progress stages */}
      <div className="w-full max-w-sm space-y-2.5">
        {STAGES.map((stage, idx) => {
          const done = idx < activeStage
          const active = idx === activeStage
          return (
            <div
              key={idx}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-500',
                active && 'bg-[#fdf3d7]/60',
                done && 'opacity-60'
              )}
            >
              <div className="shrink-0">
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#fdf3d7" />
                    <path d="M5 8L7 10L11 6" stroke="#b8860b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : active ? (
                  <div className="h-4 w-4 rounded-full border-2 border-[#d4a017] border-t-transparent animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              <span className={cn(
                'text-sm',
                active ? 'text-foreground font-medium' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'
              )}>
                {stage}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
