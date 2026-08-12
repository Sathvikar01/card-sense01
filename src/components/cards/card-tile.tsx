'use client'

import type { CreditCardListItem } from '@/types/credit-card'
import { TrendingUp, Award, ArrowRight, GitCompare } from 'lucide-react'
import { CardDetailLink } from './card-detail-link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCardVisual } from './credit-card-visual'
import { useAnalysisStore } from '@/store/use-analysis-store'
import { cn } from '@/lib/utils'

interface CardTileProps {
  card: CreditCardListItem
}

export function CardTile({ card }: CardTileProps) {
  const { comparedCardIds, toggleCompareCard } = useAnalysisStore()
  const isCompared = comparedCardIds.includes(card.id)
  const maxReached = comparedCardIds.length >= 3 && !isCompared
  const formatCardType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatFee = (fee: number) => {
    if (fee === 0) return 'Free'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(fee)
  }

  return (
    <div className="relative">
      {/* Compare toggle — sits above the link so it doesn't navigate */}
      <Button
        type="button"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          if (!maxReached) toggleCompareCard(card.id, card)
        }}
        disabled={maxReached}
        title={
          maxReached
            ? 'Max 3 cards for comparison'
            : isCompared
            ? 'Remove from comparison'
            : 'Add to comparison'
        }
        className={cn(
          'absolute right-3 top-3 z-10 h-7 gap-1 rounded-full px-2 text-[0.6rem] font-semibold shadow-md transition-[background-color,color,border-color,opacity]',
          isCompared
            ? 'bg-[#b8860b] text-white hover:bg-[#a07808] border-transparent'
            : maxReached
            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 border'
            : 'bg-white/90 text-foreground border border-border/50 hover:border-[#b8860b] hover:text-[#b8860b] backdrop-blur-sm'
        )}
      >
        <GitCompare className="h-3 w-3" />
        {isCompared ? 'Added' : 'Compare'}
      </Button>

      <CardDetailLink cardId={card.id} className="group block">
        <div
          className={cn(
            'stat-card-premium overflow-hidden',
            isCompared && 'ring-2 ring-[#b8860b]/40 ring-offset-1'
          )}
        >
          {/* Card visual */}
          <div className="flex justify-center border-b border-border/50 px-6 pb-4 pt-6">
            <CreditCardVisual cardId={card.id} size="sm" bankName={card.bank_name} interactive />
          </div>

          {/* Content */}
          <div className="space-y-4 px-5 pb-5 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{card.bank_name}</p>
                <h3 className="text-base font-semibold leading-tight text-foreground">{card.card_name}</h3>
              </div>
              {card.popularity_score >= 90 && (
                <Badge className="bg-[#fdf3d7] px-2.5 py-0.5 text-[0.55rem] uppercase tracking-wide text-[#7a5500] border-[#d4a017]/20">
                  Highly Rated
                </Badge>
              )}
            </div>

            <Badge variant="outline" className="rounded-md border-border bg-muted/40 text-[0.6rem] text-muted-foreground">
              {formatCardType(card.card_type)}
            </Badge>

            {/* Details */}
            <div className="space-y-2.5 border-t border-border/30 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Annual Fee</span>
                <span className="font-semibold text-foreground">{formatFee(card.annual_fee)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-3 w-3 text-[#b8860b]" />
                <span className="text-muted-foreground">
                  {card.reward_rate_default > 0
                    ? `${card.reward_rate_default}% estimated base return`
                    : 'See issuer earning rules'}
                </span>
              </div>

              {card.lounge_access && card.lounge_access !== 'none' && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-3 w-3 text-[#b8860b]" />
                  <span className="text-muted-foreground">Lounge access</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {card.best_for?.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="rounded-full bg-secondary/60 px-2 py-0.5 text-[0.55rem]">
                  {tag.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between border-t border-border/30 pt-3">
              <span className="text-xs font-medium text-[#b8860b]">View Details</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#b8860b]" />
            </div>
          </div>
        </div>
      </CardDetailLink>
    </div>
  )
}
