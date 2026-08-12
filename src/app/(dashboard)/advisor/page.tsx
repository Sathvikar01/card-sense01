'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAdvisorStore } from '@/lib/store/advisor-store'
import { AdvisorLoading } from '@/components/advisor/advisor-loading'
import { CardGrid } from '@/components/cards/card-grid'
import { CompareBar } from '@/components/cards/compare-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { RecommendationExplanationDialog } from '@/components/advisor/recommendation-explanation-dialog'
import { toast } from 'sonner'
import type { CreditCardListItem } from '@/types/credit-card'
import { trackInteraction } from '@/lib/interactions/client'
import { TurnstileWidget } from '@/components/security/turnstile-widget'
import { FollowUpQuestionStep } from '@/components/advisor/follow-up-question-step'
import { RESEARCHED_QUESTIONS } from '@/components/advisor/researched-questions'
import { getLatestRecordedCreditScore } from '@/lib/credit-score'

type FlowStep = 'follow-up' | 'loading' | 'results'

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
  finalDecisionReason?: string
  rulesEvaluated?: Array<{
    ruleId: string
    label: string
    weight: number
    score: number
    contribution: number
    matched: boolean
    detail?: string
  }>
  ruleScores?: {
    eligibilityFit: number
    spendFit: number
    goalFit: number
    feeFit: number
    diversificationFit: number
    weightsUsed?: {
      eligibilityFit: number
      spendFit: number
      goalFit: number
      feeFit: number
      diversificationFit: number
      primaryGoalBoost?: number
      answerInfluence?: Record<string, number>
    }
    weightedRaw?: number
    finalScore?: number
  }
  whyThisCard?: {
    headline?: string
    summary?: string
    finalDecisionReason?: string
    endpoint?: string | null
  }
}

type AdvisorResult = {
  analysis: string
  cards: AdvisorCardResult[]
}

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

  const browseCards = useMemo(() => toBrowseCards(result?.cards || []), [result])

  const explainabilityEnabled = Boolean(
    result?.cards?.some((card) =>
      card.finalDecisionReason || card.whyThisCard?.summary || (card.rulesEvaluated && card.rulesEvaluated.length > 0)
    )
  )

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
            <div className="border-y border-border/60 py-4 text-sm leading-relaxed text-foreground/90">
              {result.analysis}
            </div>
          )}

          {explainabilityEnabled && (
            <div className="border-y border-border/60 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why these picks</p>
                  <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
                    Your match score blends five signals: eligibility, spend alignment, goal fit, fee comfort, and portfolio balance.
                    Expand a card to see how each signal contributed.
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-[10px] text-primary">
                  Transparent scoring
                </Badge>
              </div>

              <div className="mt-4 px-1">
                <Accordion type="single" collapsible>
                  {result.cards.map((card, index) => {
                    const summary = card.whyThisCard?.summary || card.finalDecisionReason || card.reason
                    const scoreRows = card.ruleScores
                      ? [
                          { id: 'eligibilityFit', label: 'Eligibility', value: Number(card.ruleScores.eligibilityFit) },
                          { id: 'spendFit', label: 'Spend match', value: Number(card.ruleScores.spendFit) },
                          { id: 'goalFit', label: 'Goal match', value: Number(card.ruleScores.goalFit) },
                          { id: 'feeFit', label: 'Fee comfort', value: Number(card.ruleScores.feeFit) },
                          { id: 'diversificationFit', label: 'Portfolio balance', value: Number(card.ruleScores.diversificationFit) },
                        ].filter((row) => Number.isFinite(row.value))
                      : []
                    const topRules = [...(card.rulesEvaluated || [])]
                      .sort((a, b) => {
                        const aContribution = Number.isFinite(Number(a.contribution)) ? Number(a.contribution) : 0
                        const bContribution = Number.isFinite(Number(b.contribution)) ? Number(b.contribution) : 0
                        return bContribution - aContribution
                      })
                      .slice(0, 2)

                    return (
                      <AccordionItem key={card.id || `${index}`} value={`card-${card.id || index}`} className="border-border/40">
                        <AccordionTrigger className="py-3">
                          <div className="flex flex-1 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                #{index + 1} {card.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{card.bank}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary tabular-nums">{Math.round(card.score)}</p>
                              <p className="text-[10px] text-muted-foreground">Match</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          {summary && (
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {summary}
                            </p>
                          )}

                          {scoreRows.length > 0 && (
                            <div className="mt-4 space-y-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Score breakdown</p>
                              {scoreRows.map((row) => {
                                const clampedValue = Math.max(0, Math.min(100, row.value))
                                return (
                                  <div key={row.id} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>{row.label}</span>
                                      <span className="tabular-nums text-foreground/80">{Math.round(clampedValue)}</span>
                                    </div>
                                    <Progress value={clampedValue} className="h-1.5" />
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {topRules.length > 0 && (
                            <div className="mt-4">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Top signals</p>
                              <div className="mt-2 space-y-2">
                                {topRules.map((rule) => {
                                  const contribution = Number.isFinite(rule.contribution) ? rule.contribution : 0
                                  const scoreValue = Number.isFinite(rule.score) ? rule.score : 0
                                  const weightPct = Number.isFinite(rule.weight)
                                    ? Math.round(rule.weight * 100)
                                    : 0
                                  return (
                                    <div key={rule.ruleId} className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-foreground">{rule.label}</p>
                                        <span className="text-[10px] text-muted-foreground">Weight {weightPct}%</span>
                                      </div>
                                      {rule.detail && (
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rule.detail}</p>
                                      )}
                                      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span>Score {Math.round(scoreValue)}</span>
                                        <span>Contribution {contribution.toFixed(1)}</span>
                                        <span className={rule.matched ? 'text-emerald-600' : 'text-amber-600'}>
                                          {rule.matched ? 'Matched' : 'Partial'}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          <div className="mt-4">
                            <RecommendationExplanationDialog
                              card={card}
                              rank={index + 1}
                              triggerClassName="w-full sm:w-auto"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </div>
            </div>
          )}

          <CardGrid cards={browseCards} loading={false} />
          <CompareBar />
        </div>
      )}
    </div>
  )
}
