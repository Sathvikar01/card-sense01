'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdvisorStore } from '@/lib/store/advisor-store'
import { AdvisorResults, type AdvisorResult } from '@/components/advisor/advisor-results'
import { Button } from '@/components/ui/button'

export default function RecommendationsPage() {
  const router = useRouter()
  const store = useAdvisorStore()

  // Hydrate synchronously from Zustand (localStorage) to avoid any loading flicker
  const [recommendation, setRecommendation] = useState<AdvisorResult | null>(store.savedResult)
  const [loading, setLoading] = useState(!store.savedResult)

  useEffect(() => {
    // If already populated from local store, skip the API round-trip
    if (store.savedResult) return

    const fetchRecommendation = async () => {
      try {
        const res = await fetch('/api/recommendations/latest')
        if (res.ok) {
          const data = await res.json()
          if (data.recommendation?.cards?.length > 0) {
            const saved = data.recommendation
            const mapped: AdvisorResult = {
              persona: null,
              profileSummary: '',
              analysis: saved.analysis || '',
              cards: (saved.cards as Record<string, unknown>[]).map((card) => ({
                id: ((card.id || card.cardId) || '') as string,
                name: ((card.name || card.cardName) || '') as string,
                bank: (card.bank || '') as string,
                score: (card.score || 0) as number,
                reason: ((card.reason || card.reasoning) || '') as string,
                annualFee: ((card.annualFee || card.annualValue) || 0) as number,
                rewardRate: (card.rewardRate || 0) as number,
                estimatedAnnualValue: (card.estimatedAnnualValue || 0) as number,
                pros: ((card.pros || card.keyPerks || []) as string[]),
                cons: (card.cons || []) as string[],
                bestCategories: (card.bestCategories || []) as string[],
                eligibilityMatch: ((card.eligibilityMatch || 'moderate') as string) as 'high' | 'moderate' | 'uncertain',
                usageStrategy: (card.usageStrategy || '') as string,
              })),
            }
            store.setSavedResult(mapped)
            setRecommendation(mapped)
          } else {
            // No saved recommendation – redirect to advisor
            router.replace('/advisor')
          }
        } else {
          router.replace('/advisor')
        }
      } catch {
        router.replace('/advisor')
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStartOver = async () => {
    try {
      await fetch('/api/recommendations/latest', { method: 'DELETE' })
    } catch {
      // ignore
    }
    store.setSavedResult(null)
    router.push('/advisor?new=1')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your recommendations...</p>
        </div>
      </div>
    )
  }

  if (!recommendation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">No recommendations found.</p>
        <Button onClick={() => router.push('/advisor')}>Go to Advisor</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="px-6 py-8 sm:px-8 sm:py-10 mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b8860b]/70">Your Recommendations</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
          Your matched credit cards
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
          These cards were selected based on your profile and preferences. Start over any time to update your answers.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 sm:p-8">
        <AdvisorResults result={recommendation} onStartOver={handleStartOver} />
      </div>
    </div>
  )
}
