'use client'

import { useEffect, useState } from 'react'
import { useAdvisorStore } from '@/lib/store/advisor-store'
import { AdvisorLoading } from '@/components/advisor/advisor-loading'
import { AdvisorResults, type AdvisorCardResult, type AdvisorResult } from '@/components/advisor/advisor-results'
import { toast } from 'sonner'
import { trackInteraction } from '@/lib/interactions/client'
import { TurnstileWidget } from '@/components/security/turnstile-widget'
import { FollowUpQuestionStep } from '@/components/advisor/follow-up-question-step'
import { RESEARCHED_QUESTIONS } from '@/components/advisor/researched-questions'
import { getLatestRecordedCreditScore } from '@/lib/credit-score'

type FlowStep = 'follow-up' | 'loading' | 'results'

const TURNSTILE_ENABLED =
  /^(1|true|yes|on)$/i.test(process.env.NEXT_PUBLIC_ENABLE_TURNSTILE || '') &&
  Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
const FETCH_TIMEOUT_MS = 8000

async function fetchWithTimeout(input: string, init?: RequestInit, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
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
    finalDecisionReason: card.finalDecisionReason ? String(card.finalDecisionReason) : undefined,
    rulesEvaluated: Array.isArray(card.rulesEvaluated)
      ? (card.rulesEvaluated as AdvisorCardResult['rulesEvaluated'])
      : undefined,
    ruleScores: card.ruleScores && typeof card.ruleScores === 'object'
      ? (card.ruleScores as AdvisorCardResult['ruleScores'])
      : undefined,
    whyThisCard: card.whyThisCard && typeof card.whyThisCard === 'object'
      ? (card.whyThisCard as AdvisorCardResult['whyThisCard'])
      : undefined,
  }))
}

export default function AdvisorPage() {
  const store = useAdvisorStore()

  const [step, setStep] = useState<FlowStep>('follow-up')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileWidgetNonce, setTurnstileWidgetNonce] = useState(0)
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})
  const [monthlySpend, setMonthlySpend] = useState('')

  const persistResult = (nextResult: AdvisorResult) => {
    setResult(nextResult)
    setStep('results')

    store.setSavedResult({
      analysis: nextResult.analysis,
      cards: nextResult.cards.map((card) => ({ ...card })),
      persona: store.detectedPersona,
      profileSummary: {
        monthlyIncome: store.monthlyIncome,
        creditScore: String(store.creditScoreValue ?? store.creditScore),
        persona: store.detectedPersona ?? undefined,
        primaryGoal: store.primaryGoal,
        topSpending: store.topSpendingCategories,
        age: store.age,
        employment: store.employmentType,
      },
    })
  }

  useEffect(() => {
    void trackInteraction('advisor_started', {
      page: '/advisor',
      entityType: 'advisor_flow',
    })
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileRes, cibilRes, cardsRes, spendingRes] = await Promise.all([
          fetchWithTimeout('/api/profile'),
          fetchWithTimeout('/api/profile/cibil'),
          fetchWithTimeout('/api/cards/user'),
          fetchWithTimeout('/api/spending'),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          const profile = data.profile || data
          const latestHistory = cibilRes.ok
            ? (((await cibilRes.json()).history || []) as Array<{ credit_score: number; score_date: string }>)
            : []

          const latestScore = getLatestRecordedCreditScore(latestHistory, profile?.credit_score)

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

        if (spendingRes.ok) {
          const spendingData = await spendingRes.json()
          const byCategory = (spendingData?.aggregates?.by_category || {}) as Record<string, number>
          store.prefillFromSpending({ byCategory })
        }
      } catch {
        // Non-fatal, user can still fill advisor manually
      }
    }

    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false

    if (store.savedResult?.cards?.length) {
      setResult({
        analysis: store.savedResult.analysis || '',
        cards: store.savedResult.cards.map((card) => ({ ...card })),
      })
      setStep('results')
    }

    const hydrateSaved = async () => {
      try {
        const res = await fetchWithTimeout('/api/recommendations/latest')
        if (!res.ok) {
          return
        }

        const data = await res.json()
        if (!data.recommendation?.cards?.length) {
          return
        }

        const mapped: AdvisorResult = {
          analysis: data.recommendation.analysis || '',
          cards: mapCards(data.recommendation.cards as Record<string, unknown>[]),
        }
        if (cancelled) {
          return
        }
        persistResult(mapped)
      } catch {
        // ignore
      }
    }

    void hydrateSaved()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleComplete = async (answers: Record<string, string>) => {
    if (TURNSTILE_ENABLED && !turnstileToken) {
      const message = 'Please complete the security check before requesting recommendations'
      setError(message)
      toast.error(message)
      return
    }

    const keepTurnstileToken = false

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

      const enrichedPayload = {
        ...payload,
        city: store.city || 'Not provided',
        primaryBank: store.primaryBank || 'Not provided',
        monthlySpending: Number(monthlySpend) || 0,
        monthlySpendEstimate: Number(monthlySpend) || 0,
        spendingBreakdown: Number(monthlySpend) > 0
          ? {
              [answers.primary_spend_focus === 'shopping' ? 'online_shopping' : answers.primary_spend_focus]: Number(monthlySpend),
            }
          : payload.spendingBreakdown,
        followUpAnswers: answers,
      }

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...enrichedPayload,
          turnstileToken: TURNSTILE_ENABLED ? turnstileToken : undefined,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Failed to get recommendations'
        )
      }

      persistResult({
        analysis: data.analysis || '',
        cards: mapCards((data.cards || []) as Record<string, unknown>[]),
      })
      toast.success('Recommendations ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get recommendations'
      setError(message)
      setStep('follow-up')
      toast.error(message)
    } finally {
      setIsLoading(false)
      if (TURNSTILE_ENABLED && !keepTurnstileToken) {
        setTurnstileToken('')
        setTurnstileWidgetNonce((value) => value + 1)
      }
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
    setStep('follow-up')
    setResult(null)
    setError(null)
    setFollowUpAnswers({})
    setMonthlySpend('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advisor</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Answer key eligibility, spending, and goal questions to get tailored credit card matches.
        </p>
      </div>

      {error && step === 'follow-up' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'follow-up' && (
        <>
          <FollowUpQuestionStep
            questions={RESEARCHED_QUESTIONS}
            answers={followUpAnswers}
            monthlySpend={monthlySpend}
            onAnswer={(questionId, value) => {
              setFollowUpAnswers((current) => ({ ...current, [questionId]: value }))
            }}
            onMonthlySpendChange={setMonthlySpend}
            onSubmit={() => void handleComplete(followUpAnswers)}
            isSubmitting={isLoading}
          />
          {TURNSTILE_ENABLED && (
            <div className="pt-2">
              <p className="mb-2 text-xs text-muted-foreground">
                Complete this quick security check to enable recommendation requests.
              </p>
              <TurnstileWidget
                key={turnstileWidgetNonce}
                siteKey={TURNSTILE_SITE_KEY}
                action="ai_recommendation"
                onToken={setTurnstileToken}
                onError={() => toast.error('Unable to load security check. Please refresh.')}
              />
            </div>
          )}
        </>
      )}

      {step === 'loading' && (
        <div>
          <AdvisorLoading />
        </div>
      )}

      {step === 'results' && result && <AdvisorResults result={result} onStartOver={handleStartOver} />}
    </div>
  )
}
