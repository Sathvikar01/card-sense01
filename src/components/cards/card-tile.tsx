'use client'

import { Check, Plus } from 'lucide-react'
import type { CreditCardListItem } from '@/types/credit-card'
import { useAnalysisStore } from '@/store/use-analysis-store'
import { cn } from '@/lib/utils'
import { CardDetailLink } from './card-detail-link'
import { CreditCardVisual } from './credit-card-visual'

const MAX_COMPARE = 3

const formatFee = (fee: number) =>
  fee === 0
    ? 'No annual fee'
    : `${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(fee)}/yr`

export function CardTile({ card }: { card: CreditCardListItem }) {
  const { comparedCardIds, toggleCompareCard } = useAnalysisStore()
  const isCompared = comparedCardIds.includes(card.id)
  const maxReached = comparedCardIds.length >= MAX_COMPARE && !isCompared

  return (
    <div className="group">
      <CardDetailLink cardId={card.id} className="block">
        <div className="transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-y-1">
          <CreditCardVisual
            cardId={card.id}
            cardSlug={card.card_slug}
            size="md"
            cardName={card.card_name}
            bankName={card.bank_name}
            network={card.card_network}
            imageUrl={card.image_url}
            className="w-full"
          />
        </div>
      </CardDetailLink>

      <div className="mt-4 flex items-start justify-between gap-3">
        <CardDetailLink cardId={card.id} className="min-w-0">
          <h3 className="truncate text-[15px] font-medium">{card.card_name}</h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {card.bank_name} · {formatFee(card.annual_fee)}
            {card.reward_rate_default > 0 && ` · ${card.reward_rate_default}% back`}
          </p>
        </CardDetailLink>

        <button
          type="button"
          onClick={() => toggleCompareCard(card.id, card)}
          disabled={maxReached}
          aria-pressed={isCompared}
          aria-label={isCompared ? `Remove ${card.card_name} from compare` : `Compare ${card.card_name}`}
          title={maxReached ? `Compare up to ${MAX_COMPARE}` : 'Compare'}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-30',
            isCompared
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
          )}
        >
          {isCompared ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
