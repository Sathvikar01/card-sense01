'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { CardDetailLink } from '@/components/cards/card-detail-link'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/use-analysis-store'
import { motion } from 'framer-motion'
import type { SavedAdvisorCard, SavedAdvisorResult } from '@/lib/store/advisor-store'
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
  if (level === 'high') return 'Likely approval'
  if (level === 'moderate') return 'Possible approval'
  return 'Approval uncertain'
}

function RecommendedCardRow({ card, rank }: { card: AdvisorCardResult; rank: number }) {
  const hasExplanation = Boolean(card.whyThisCard?.summary || card.finalDecisionReason || card.reason)
  const stats = [
    ['Annual fee', card.annualFee === 0 ? 'Free' : formatInr(card.annualFee)],
    ['Rewards', card.rewardRate > 0 ? `${card.rewardRate}%` : '—'],
    ['Value / yr', card.estimatedAnnualValue > 0 ? formatInr(card.estimatedAnnualValue) : '—'],
  ]

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (rank - 1) * 0.06, ease: [0.23, 1, 0.32, 1] }}
      className="surface grid gap-5 p-5 sm:grid-cols-[180px_1fr] sm:p-6"
    >
      <CardDetailLink cardId={card.id} className="block self-start">
        <CreditCardVisual
          cardId={card.id}
          cardSlug={card.cardSlug}
          size="sm"
          cardName={card.name}
          bankName={card.bank}
          imageUrl={card.imageUrl}
          className="w-full"
        />
      </CardDetailLink>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight">
              <span className="mr-2 tabular-nums text-muted-foreground">{rank}</span>
              {card.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {card.bank} · {eligibilityLabel(card.eligibilityMatch)}
            </p>
          </div>
          <p
            className={cn(
              'shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums',
              rank === 1 ? 'bg-gold text-pine' : 'bg-muted'
            )}
            aria-label={`Match score ${card.score} of 100`}
          >
            {card.score}
          </p>
        </div>

        {card.reason && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/80">{card.reason}</p>}

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <CardDetailLink cardId={card.id} className="font-medium text-primary hover:underline">
            Details
          </CardDetailLink>
          {hasExplanation && (
            <RecommendationExplanationDialog card={card} rank={rank} triggerLabel="Why this card" triggerClassName="w-auto" />
          )}
        </div>
      </div>
    </motion.li>
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
      card_slug: card.cardSlug || card.id,
      card_name: card.name,
      bank_name: card.bank,
      card_network: 'visa' as const,
      card_variant: 'classic' as const,
      image_url: card.imageUrl || null,
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
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[28px] font-semibold tracking-tight">Your matches</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onStartOver}>
            Start over
          </Button>
          {result.cards.length >= 2 && (
            <Button variant="outline" size="sm" onClick={handleCompareAll}>
              Compare
            </Button>
          )}
        </div>
      </div>

      {result.analysis && <p className="max-w-2xl px-1 text-[15px] leading-relaxed text-foreground/80">{result.analysis}</p>}

      <ol className="mt-6 space-y-3">
        {result.cards.map((card, index) => (
          <RecommendedCardRow key={card.id} card={card} rank={index + 1} />
        ))}
      </ol>

      <p className="mt-6 px-1 text-xs text-muted-foreground">Approval, fees and rewards are set by the issuer.</p>
    </div>
  )
}
