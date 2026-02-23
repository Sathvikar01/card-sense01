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

  const [step, setStep] = useState<FlowStep>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkedSaved, setCheckedSaved] = useState(false)

  // Fetch profile and pre-fill advisor store on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          const profile = data.profile || data
          if (profile) {
            store.prefillFromProfile({
              creditScore: profile.credit_score,
              employmentType: profile.employment_type,
              annualIncome: profile.annual_income,
              city: profile.city,
              primaryBank: profile.primary_bank,
              hasFD: profile.has_fixed_deposit,
              fdAmount: profile.fd_amount,
            })
          }
        }
      } catch {
        // Profile fetch failure is non-fatal; advisor still works
      }
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After mount, wait for Zustand to finish rehydrating, then decide whether to show saved results
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

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedPayload),
      })

      if (!response.ok) {
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
        toast.success('Recommendations ready')
        return
      }

      const data = await response.json()
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
      toast.success('Recommendations ready')
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
    try {
      await fetch('/api/recommendations/latest', { method: 'DELETE' })
    } catch {
      // Ignore errors
    }
    store.setSavedResult(null)
    store.reset()
    setStep('input')
    setResult(null)
    setError(null)
  }

  // Loading spinner while checking saved state
  if (!checkedSaved && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-7 w-7 text-[#b8860b]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero header — only shown during input */}
      {step === 'input' && (
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a017]/30 bg-[#fdf3d7]/60 px-3 py-1 mb-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.8 4.7L13 5.3L10 8.2L10.7 12.4L7 10.5L3.3 12.4L4 8.2L1 5.3L5.2 4.7L7 1Z" fill="#b8860b" stroke="#b8860b" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#b8860b]">Smart Advisor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Find your ideal credit card
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
            Answer a few questions about your habits and goals. We use your profile data to skip the basics and give you a tighter match.
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && step === 'input' && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 shrink-0 text-red-500">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 5.5V10M9 12.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Could not generate recommendations</p>
            <p className="text-xs text-red-600/80 mt-0.5">{error}</p>
            <button onClick={() => setError(null)} className="text-xs font-medium text-[#b8860b] mt-1.5 hover:underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main content card */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-sm">
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
        <p className="text-[11px] text-muted-foreground/70 text-center mt-5 leading-relaxed max-w-sm mx-auto">
          Your data is used only to generate recommendations and is not shared with card issuers.
        </p>
      )}
    </div>
  )
}

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
