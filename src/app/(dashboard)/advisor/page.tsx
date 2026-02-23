'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAdvisorStore } from '@/lib/store/advisor-store'
import { AdvisorStepper } from '@/components/advisor/advisor-stepper'
import { AdvisorLoading } from '@/components/advisor/advisor-loading'
import { CardGrid } from '@/components/cards/card-grid'
import { CompareBar } from '@/components/cards/compare-bar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { CreditCardListItem } from '@/types/credit-card'
import { trackInteraction } from '@/lib/interactions/client'

type FlowStep = 'input' | 'loading' | 'results'

type AdvisorCardResult = {
  id: string
  name: string
  bank: string
  score: number
  reason: string
  annualFee: number
  rewardRate: number
  estimatedAnnualValue: number
  pros: string[]
  cons: string[]
  bestCategories: string[]
  eligibilityMatch: 'high' | 'moderate' | 'uncertain'
  usageStrategy: string
}

type AdvisorResult = {
  analysis: string
  cards: AdvisorCardResult[]
}

function mapCards(cards: Record<string, unknown>[] = []): AdvisorCardResult[] {
  return cards.map((card) => ({
    id: String((card.id || card.cardId) || ''),
    name: String((card.name || card.cardName) || ''),
    bank: String(card.bank || ''),
    score: Number(card.score || 0),
    reason: String((card.reason || card.reasoning) || ''),
    annualFee: Number((card.annualFee || card.annualValue) || 0),
    rewardRate: Number(card.rewardRate || 0),
    estimatedAnnualValue: Number((card.estimatedAnnualValue || card.annualValue) || 0),
    pros: ((card.pros || card.keyPerks || []) as string[]),
    cons: ((card.cons || []) as string[]),
    bestCategories: ((card.bestCategories || card.bestFor || []) as string[]),
    eligibilityMatch: ((card.eligibilityMatch || 'moderate') as 'high' | 'moderate' | 'uncertain'),
    usageStrategy: String(card.usageStrategy || ''),
  }))
}

function toBrowseCards(cards: AdvisorCardResult[]): CreditCardListItem[] {
  return cards
    .filter((card) => Boolean(card.id))
    .map((card) => {
      const inferredType: CreditCardListItem['card_type'] = card.bestCategories.some((v) => /travel|lounge/i.test(v))
        ? 'travel'
        : card.bestCategories.some((v) => /fuel/i.test(v))
          ? 'fuel'
          : card.bestCategories.some((v) => /cashback|shopping|dining|grocery/i.test(v))
            ? 'cashback'
            : 'rewards'

      const lounge = card.bestCategories.some((v) => /lounge|travel/i.test(v)) ? 'domestic_only' : 'none'

      return {
        id: card.id,
        bank_name: card.bank || 'Bank',
        card_name: card.name || 'Recommended Card',
        card_type: inferredType,
        annual_fee: card.annualFee,
        reward_rate_default: card.rewardRate,
        lounge_access: lounge,
        best_for: card.bestCategories,
        popularity_score: Math.max(45, Math.min(99, Math.round(card.score))),
      }
    })
}

export default function AdvisorPage() {
  const store = useAdvisorStore()
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === '1'

  const [step, setStep] = useState<FlowStep>('input')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkedSaved, setCheckedSaved] = useState(false)

  useEffect(() => {
    void trackInteraction('advisor_started', {
      page: '/advisor',
      entityType: 'advisor_flow',
    })
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, cibilRes, cardsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/profile/cibil'),
          fetch('/api/cards/user'),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          const profile = data.profile || data
          const latestHistory = cibilRes.ok
            ? (((await cibilRes.json()).history || []) as Array<{ credit_score: number; score_date: string }>)
            : []

          const latestScore = latestHistory.length > 0
            ? [...latestHistory].sort((a, b) => b.score_date.localeCompare(a.score_date))[0]?.credit_score
            : profile?.credit_score

          const existingCards = cardsRes.ok
            ? ((await cardsRes.json()).cards || []).map((card: { card_name: string }) => card.card_name)
            : []

          store.prefillFromProfile({
            creditScore: latestScore,
            employmentType: profile?.employment_type,
            annualIncome: profile?.annual_income,
            city: profile?.city,
            primaryBank: profile?.primary_bank,
            hasFD: profile?.has_fixed_deposit,
            fdAmount: profile?.fd_amount,
            existingCards,
          })
        }
      } catch {
        // Non-fatal, user can still fill advisor manually
      }
    }

    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isNew) {
      setCheckedSaved(true)
      return
    }

    const hydrateSaved = async () => {
      try {
        const res = await fetch('/api/recommendations/latest')
        if (!res.ok) {
          setCheckedSaved(true)
          return
        }

        const data = await res.json()
        if (!data.recommendation?.cards?.length) {
          setCheckedSaved(true)
          return
        }

        const mapped: AdvisorResult = {
          analysis: data.recommendation.analysis || '',
          cards: mapCards(data.recommendation.cards as Record<string, unknown>[]),
        }
        setResult(mapped)
        setStep('results')
      } catch {
        // ignore
      } finally {
        setCheckedSaved(true)
      }
    }

    hydrateSaved()
  }, [isNew])

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setStep('loading')

      const payload = store.getApiPayload()

      await trackInteraction('advisor_submitted', {
        page: '/advisor',
        entityType: 'advisor_flow',
        metadata: {
          monthlyIncome: payload.monthlyIncome as number,
          cibilScore: payload.cibilScore as number,
          prefilledFields: store.profilePrefilledFields,
        },
      })

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

      const enrichedPayload = {
        ...payload,
        followUpAnswers: {
          age_band: ageBand,
          income_profile: incomeProfile,
          secured_card_readiness: securedReadiness,
          primary_spend_focus: spendFocus,
          value_priority: goalToValue[primaryGoal] || 'cashback_everyday',
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
        const mapped = {
          analysis: data.overall_analysis || '',
          cards: mapCards((data.recommendations || data.cards || []) as Record<string, unknown>[]),
        }
        setResult(mapped)
        setStep('results')
        toast.success('Recommendations ready')
        return
      }

      const data = await response.json()
      setResult({
        analysis: data.analysis || '',
        cards: mapCards((data.cards || []) as Record<string, unknown>[]),
      })
      setStep('results')
      toast.success('Recommendations ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get recommendations'
      setError(message)
      setStep('input')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOver = async () => {
    try {
      await fetch('/api/recommendations/latest', { method: 'DELETE' })
    } catch {
      // ignore
    }
    store.setSavedResult(null)
    store.reset()
    setStep('input')
    setResult(null)
    setError(null)
  }

  const browseCards = useMemo(() => toBrowseCards(result?.cards || []), [result])

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advisor</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Answer key eligibility, spending, and goal questions to get tailored credit card matches.
        </p>
      </div>

      {error && step === 'input' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'input' && (
        <div className="rounded-2xl border border-border/60 bg-white shadow-sm">
          <AdvisorStepper onComplete={handleComplete} isLoading={isLoading} />
        </div>
      )}

      {step === 'loading' && (
        <div className="rounded-2xl border border-border/60 bg-white shadow-sm">
          <AdvisorLoading />
        </div>
      )}

      {step === 'results' && result && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Recommended Cards</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Showing {browseCards.length} matched cards in Browse Cards view.
              </p>
            </div>
            <Button variant="outline" onClick={handleStartOver}>Start Over</Button>
          </div>

          {result.analysis && (
            <div className="rounded-xl border border-border/60 bg-white p-4 text-sm leading-relaxed text-foreground/90">
              {result.analysis}
            </div>
          )}

          <CardGrid cards={browseCards} loading={false} />
          <CompareBar />
        </div>
      )}
    </div>
  )
}
