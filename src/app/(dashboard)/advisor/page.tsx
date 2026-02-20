'use client'

import { useState, useEffect } from 'react'
import { useAdvisorStore } from '@/lib/store/advisor-store'
import { AdvisorStepper } from '@/components/advisor/advisor-stepper'
import { AdvisorLoading } from '@/components/advisor/advisor-loading'
import { AdvisorResults, type AdvisorResult } from '@/components/advisor/advisor-results'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

type FlowStep = 'input' | 'loading' | 'results'

export default function AdvisorPage() {
  const store = useAdvisorStore()
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === '1'

  // Always start in a neutral "checking" state — useState initialisers run before
  // Zustand's persist middleware has rehydrated from localStorage, so reading
  // store.savedResult here would always return null on a hard reload.
  const [step, setStep] = useState<FlowStep>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkedSaved, setCheckedSaved] = useState(false)

  // After mount, wait for Zustand to finish rehydrating from localStorage,
  // then decide whether to show saved results or the questionnaire.
  useEffect(() => {
    if (isNew) {
      setCheckedSaved(true)
      return
    }

    const applyResult = (saved: AdvisorResult) => {
      setResult(saved)
      setStep('results')
      setCheckedSaved(true)
    }

    const fallbackToApi = async () => {
      try {
        const res = await fetch('/api/recommendations/latest')
        if (res.ok) {
          const data = await res.json()
          if (data.recommendation?.cards?.length > 0) {
            const saved = data.recommendation
            const mappedResult: AdvisorResult = {
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
            store.setSavedResult(mappedResult)
            applyResult(mappedResult)
            return
          }
        }
      } catch {
        // fall through
      }
      setCheckedSaved(true)
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
  }, [isNew])

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setStep('loading')

      const payload = store.getApiPayload()

      // Pre-populate followUpAnswers from advisor store data so we skip the needs_more_info round-trip
      const age = (payload.age as number) || 28
      const annualIncome = (payload.annualIncome as number) || 0
      const hasFD = payload.hasFixedDeposits as boolean
      const willingSecured = payload.willingSecuredCard as boolean
      const topCategories = (payload.topSpendingCategories as string[]) || []
      const primaryGoal = (payload.primaryGoal as string) || 'rewards_cashback'

      const ageBand = age <= 20 ? '18_20' : age <= 24 ? '21_24' : age <= 30 ? '25_30' : '31_plus'
      const incomeProfile = annualIncome <= 0
        ? 'no_personal_income'
        : annualIncome <= 300000
          ? 'stipend_or_part_time'
          : annualIncome <= 600000
            ? 'stable_income_upto_6l'
            : 'stable_income_above_6l'
      const securedReadiness = hasFD ? 'have_fd_now' : willingSecured ? 'can_start_fd' : 'unsecured_only'
      const spendFocus = topCategories[0] === 'online_shopping' ? 'shopping' : (topCategories[0] || 'shopping')
      const goalToValue: Record<string, string> = {
        credit_building: 'build_credit_low_fee',
        debt_management: 'build_credit_low_fee',
        low_interest: 'build_credit_low_fee',
        rewards_cashback: 'cashback_everyday',
        fuel_savings: 'cashback_everyday',
        online_shopping: 'cashback_everyday',
        travel_perks: 'travel_perks',
        premium_lifestyle: 'travel_perks',
      }
      const valuePriority = goalToValue[primaryGoal] || 'cashback_everyday'

      const enrichedPayload = {
        ...payload,
        followUpAnswers: {
          age_band: ageBand,
          income_profile: incomeProfile,
          secured_card_readiness: securedReadiness,
          primary_spend_focus: spendFocus,
          value_priority: valuePriority,
        },
      }

      // Try the experienced endpoint (it has the full recommendation logic)
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedPayload),
      })

      if (!response.ok) {
        // Fallback to beginner endpoint if recommend fails
        const beginnerResponse = await fetch('/api/ai/beginner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!beginnerResponse.ok) {
          const errorData = await beginnerResponse.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to get recommendations')
        }

        const beginnerData = await beginnerResponse.json()
        const data = beginnerData.data ?? beginnerData

        const mappedResult: AdvisorResult = {
          persona: store.detectedPersona,
          profileSummary: '',
          analysis: data.overall_analysis || '',
          cards: (data.recommendations || data.cards || []).map((card: Record<string, unknown>) => ({
            id: (card.cardId || card.id || '') as string,
            name: (card.cardName || card.name || '') as string,
            bank: (card.bank || '') as string,
            score: (card.score || 0) as number,
            reason: (card.reasoning || card.reason || '') as string,
            annualFee: (card.annualFee || 0) as number,
            rewardRate: (card.rewardRate || 0) as number,
            estimatedAnnualValue: (card.annualValue || 0) as number,
            pros: (card.keyPerks || card.pros || []) as string[],
            cons: (card.cons || []) as string[],
            bestCategories: (card.bestCategories || card.bestFor || []) as string[],
            eligibilityMatch: ((card.eligibilityMatch || 'moderate') as string) as 'high' | 'moderate' | 'uncertain',
            usageStrategy: (card.usageStrategy || '') as string,
          })),
        }

        store.setSavedResult(mappedResult)
        setResult(mappedResult)
        setStep('results')
        toast.success('Recommendations generated')
        return
      }

      const data = await response.json()

      // Handle the needs_more_info case by just using whatever cards are returned
      const cards = data.cards || []
      const mappedResult: AdvisorResult = {
        persona: store.detectedPersona,
        profileSummary: buildProfileSummary(payload),
        analysis: data.analysis || '',
        cards: cards.map((card: Record<string, unknown>) => ({
          id: (card.id || '') as string,
          name: (card.name || '') as string,
          bank: (card.bank || '') as string,
          score: (card.score || 0) as number,
          reason: (card.reason || '') as string,
          annualFee: (card.annualFee || 0) as number,
          rewardRate: (card.rewardRate || 0) as number,
          estimatedAnnualValue: (card.annualValue || card.estimatedAnnualValue || 0) as number,
          pros: (card.pros || card.keyPerks || []) as string[],
          cons: (card.cons || []) as string[],
          bestCategories: (card.bestCategories || card.bestFor || []) as string[],
          eligibilityMatch: ((card.eligibilityMatch || 'moderate') as string) as 'high' | 'moderate' | 'uncertain',
          usageStrategy: (card.usageStrategy || '') as string,
        })),
      }

      store.setSavedResult(mappedResult)
      setResult(mappedResult)
      setStep('results')
      toast.success('Recommendations generated')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations'
      setError(errorMessage)
      toast.error(errorMessage)
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOver = async () => {
    // Clear saved recommendation from Supabase and local store
    try {
      await fetch('/api/recommendations/latest', { method: 'DELETE' })
    } catch {
      // Ignore errors clearing the saved recommendation
    }
    store.setSavedResult(null)
    store.reset()
    setStep('input')
    setResult(null)
    setError(null)
  }

  // Show spinner while checking for saved recommendations
  if (!checkedSaved && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero header */}
      {step === 'input' && (
        <div className="advisor-hero px-6 py-8 sm:px-8 sm:py-10 mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b8860b]/70">Smart Advisor</p>
          <h1 className="cardsense-hero-title text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Find your ideal credit card
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg leading-relaxed">
            Answer a series of questions about your finances, habits, and goals.
            We will match you with cards that genuinely fit your profile -- not generic top-10 lists.
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && step === 'input' && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4">
          <div className="flex items-start gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 shrink-0 text-destructive">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 5.5V10M9 12.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Could not generate recommendations</p>
              <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs font-medium text-[#b8860b] mt-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 sm:p-8">
        {step === 'input' && (
          <AdvisorStepper onComplete={handleComplete} isLoading={isLoading} />
        )}

        {step === 'loading' && <AdvisorLoading />}

        {step === 'results' && result && (
          <AdvisorResults result={result} onStartOver={handleStartOver} />
        )}
      </div>

      {/* Footer note */}
      {step === 'input' && (
        <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed max-w-md mx-auto">
          Your data stays in your browser and is sent only to generate recommendations. We do not share personal information with card issuers without your consent.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildProfileSummary(payload: Record<string, unknown>) {
  return {
    monthlyIncome: (payload.monthlyIncome as number) || undefined,
    creditScore: payload.cibilScore ? `~${payload.cibilScore}` : undefined,
    persona: payload.detectedPersona ? String(payload.detectedPersona).replace(/_/g, ' ') : undefined,
    primaryGoal: payload.primaryGoal ? String(payload.primaryGoal).replace(/_/g, ' ') : undefined,
    topSpending: (payload.topSpendingCategories as string[])?.map((c) => c.replace(/_/g, ' ')) ?? undefined,
    age: (payload.age as number) || undefined,
    employment: payload.employmentType ? String(payload.employmentType).replace(/_/g, ' ') : undefined,
  }
}
