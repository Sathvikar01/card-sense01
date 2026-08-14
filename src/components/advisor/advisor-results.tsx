'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { CardDetailLink } from '@/components/cards/card-detail-link'
import { ArrowRight, GitCompare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/use-analysis-store'
import { motion } from 'framer-motion'
import type { SavedAdvisorCard, SavedAdvisorResult, ProfileSummaryData } from '@/lib/store/advisor-store'
import { trackInteraction } from '@/lib/interactions/client'
import { RecommendationExplanationDialog } from '@/components/advisor/recommendation-explanation-dialog'

export type AdvisorCardResult = SavedAdvisorCard
export type AdvisorResult = Pick<SavedAdvisorResult, 'cards' | 'analysis'> &
  Partial<Pick<SavedAdvisorResult, 'persona' | 'profileSummary'>>

function formatInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function eligibilityLabel(level: AdvisorCardResult['eligibilityMatch']) {
  if (level === 'high') return 'High likelihood'
  if (level === 'moderate') return 'Moderate likelihood'
  return 'Approval uncertain'
}

function ProfileSummaryLine({ data }: { data: ProfileSummaryData }) {
  const details = [
    data.monthlyIncome ? `${formatInr(data.monthlyIncome)} monthly income` : null,
    data.creditScore ? `CIBIL ${data.creditScore}` : null,
    data.age ? `${data.age} years old` : null,
    data.employment ? data.employment.replace(/_/g, ' ') : null,
  ].filter(Boolean) as string[]

  if (data.topSpending?.length) details.push(`Spends most on ${data.topSpending.slice(0, 3).join(', ')}`)
  if (details.length === 0) return null

  return (
    <section className="border-y border-border py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Based on your profile</p>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-foreground/75">{details.join(' · ')}</p>
    </section>
  )
}

function RecommendedCardRow({ card, rank }: { card: AdvisorCardResult; rank: number }) {
  const explanation = card.whyThisCard?.summary || card.finalDecisionReason || card.reason
  const categories = card.bestCategories.length > 0 ? card.bestCategories.slice(0, 2) : []

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: (rank - 1) * 0.08 }}
      className={cn(
        'border-t border-border py-8 first:border-t-0 sm:py-10',
        rank === 1 && 'border-l-2 border-primary pl-4 sm:pl-6'
      )}
    >
      <div className="grid gap-7 lg:grid-cols-[12rem_minmax(0,1fr)_6rem] lg:items-start lg:gap-8">
        <div className="flex justify-start sm:justify-center lg:justify-start">
          <CreditCardVisual cardId={card.id} size="sm" bankName={card.bank} interactive />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono text-[0.68rem] tracking-[0.16em] text-primary">{String(rank).padStart(2, '0')}</span>
            <span>{card.bank}</span>
            <span aria-hidden="true">·</span>
            <span>{eligibilityLabel(card.eligibilityMatch)}</span>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-2xl">{card.name}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75">{card.reason}</p>
          {categories.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Best for: {categories.map((category) => category.replace(/_/g, ' ')).join(' · ')}</p>}
        </div>

        <div className="flex items-baseline gap-2 lg:block lg:text-right">
          <span className="text-xs text-muted-foreground">Match</span>
          <span className="text-3xl font-semibold tabular-nums tracking-[-0.04em] text-foreground">{card.score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-3 divide-x divide-border border-y border-border py-4">
        <div className="pr-4 sm:pr-6"><dt className="text-xs text-muted-foreground">Annual fee</dt><dd className="mt-1 text-sm font-semibold text-foreground">{card.annualFee === 0 ? 'Free' : formatInr(card.annualFee)}</dd></div>
        <div className="px-4 sm:px-6"><dt className="text-xs text-muted-foreground">Reward rate</dt><dd className="mt-1 text-sm font-semibold text-foreground">{card.rewardRate > 0 ? `${card.rewardRate}%` : 'Issuer rules'}</dd></div>
        <div className="pl-4 sm:pl-6"><dt className="text-xs text-muted-foreground">Est. annual value</dt><dd className="mt-1 text-sm font-semibold text-foreground">{card.estimatedAnnualValue > 0 ? formatInr(card.estimatedAnnualValue) : 'Not listed'}</dd></div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <CardDetailLink cardId={card.id} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-foreground">
          View card details <ArrowRight className="h-4 w-4" />
        </CardDetailLink>
        {explanation && <RecommendationExplanationDialog card={card} rank={rank} triggerLabel="How we matched it" triggerClassName="w-auto" />}
      </div>
    </motion.article>
  )
}

interface Props {
  result: AdvisorResult
  onStartOver: () => void
}

export function AdvisorResults({ result, onStartOver }: Props) {
  const router = useRouter()
  const { setComparisonFromCards } = useAnalysisStore()

  const handleCompareAll = () => {
    const compareCards = result.cards.map((card) => ({
      id: card.id,
      card_name: card.name,
      bank_name: card.bank,
      card_type: 'rewards' as const,
      annual_fee: card.annualFee,
      reward_rate_default: card.rewardRate,
      lounge_access: 'none',
      best_for: card.bestCategories,
      popularity_score: card.score,
    }))
    setComparisonFromCards(compareCards)
    void trackInteraction('compare_started', {
      page: '/advisor',
      entityType: 'advisor_result',
      metadata: { comparedCardIds: compareCards.map((card) => card.id) },
    })
    router.push('/cards/compare')
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Recommendation</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Recommended Cards</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{result.cards.length} match{result.cards.length === 1 ? '' : 'es'} ranked by eligibility, spending fit, goals, fees, and portfolio balance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {result.cards.length >= 2 && <Button variant="outline" size="sm" onClick={handleCompareAll} className="gap-2"><GitCompare className="h-3.5 w-3.5" /> Compare all</Button>}
          <Button variant="ghost" size="sm" onClick={onStartOver}>Adjust answers</Button>
        </div>
      </header>

      {result.profileSummary && (typeof result.profileSummary === 'string' ? (
        <section className="border-y border-border py-5"><p className="text-sm leading-6 text-foreground/75">{result.profileSummary}</p></section>
      ) : <ProfileSummaryLine data={result.profileSummary} />)}

      {result.analysis && (
        <section className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What stood out</p>
          <p className="mt-3 text-base leading-7 text-foreground/80">{result.analysis}</p>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your shortlist</p><p className="mt-2 text-sm text-muted-foreground">{result.cards.length} options, ordered by fit.</p></div>
          <span className="hidden text-xs text-muted-foreground sm:block">Start with #1</span>
        </div>
        <div>{result.cards.map((card, index) => <RecommendedCardRow key={card.id} card={card} rank={index + 1} />)}</div>
      </section>

      <p className="mx-auto max-w-2xl text-center text-[11px] leading-5 text-muted-foreground">Recommendations use publicly available card information and your stated profile. Actual approval, fees and rewards depend on the issuer&apos;s current terms.</p>
    </div>
  )
}
