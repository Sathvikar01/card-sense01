'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdvisorStore } from '@/lib/store/advisor-store'
import { AdvisorResults, type AdvisorResult } from '@/components/advisor/advisor-results'
import { mapAdvisorCards } from '@/lib/recommendations/map-advisor-cards'
import { EmptyState } from '@/components/shared/empty-state'

export default function RecommendationsPage() {
  const router = useRouter()
  const store = useAdvisorStore()

  // Always start loading — useState runs before Zustand persist has rehydrated
  // from localStorage, so store.savedResult would be null on first render.
  const [recommendation, setRecommendation] = useState<AdvisorResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const applyResult = (saved: AdvisorResult) => {
      setRecommendation(saved)
      setLoading(false)
    }

    const fallbackToApi = async () => {
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
              cards: mapAdvisorCards(saved.cards as Record<string, unknown>[]),
            }
            store.setSavedResult({
              ...mapped,
              persona: mapped.persona ?? null,
              profileSummary: mapped.profileSummary ?? '',
            })
            applyResult(mapped)
            return
          }
        }
      } catch {
        // fall through to redirect
      }
      router.replace('/advisor')
    }

    const checkAfterHydration = () => {
      const savedResult = useAdvisorStore.getState().savedResult
      if (savedResult) {
        applyResult(savedResult)
      } else {
        fallbackToApi()
      }
    }

    if (useAdvisorStore.persist.hasHydrated()) {
      checkAfterHydration()
    } else {
      const unsub = useAdvisorStore.persist.onFinishHydration(checkAfterHydration)
      return unsub
    }
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

  if (loading) return <div className="h-96 shimmer rounded-xl" aria-busy="true" />

  if (!recommendation) {
    return <EmptyState title="No matches yet" actionLabel="Find my card" actionHref="/advisor" />
  }

  return <AdvisorResults result={recommendation} onStartOver={handleStartOver} />
}
