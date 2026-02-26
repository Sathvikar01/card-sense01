'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  GitCompare,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { useAnalysisStore } from '@/store/use-analysis-store'
import type { CreditCard } from '@/types/credit-card'
import { formatCurrency } from '@/lib/utils/format-currency'
import { cn } from '@/lib/utils'
import { trackInteraction } from '@/lib/interactions/client'

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  ) : (
    <XCircle className="h-4 w-4 text-muted-foreground/50" />
  )
}

function formatFee(value: number) {
  return value === 0 ? 'Free' : formatCurrency(value, { showDecimals: false })
}

function formatCardType(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function withKey(value: string, index: number) {
  return `${value}-${index}`
}

export default function CardComparePage() {
  const router = useRouter()
  const { comparedCardIds, comparedCards, clearComparison, hasHydrated } = useAnalysisStore()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    const fallbackIds = comparedCards.map((card) => card.id)
    const ids = Array.from(
      new Set((comparedCardIds.length > 0 ? comparedCardIds : fallbackIds).filter(Boolean))
    )
    if (ids.length < 2) {
      setCards([])
      setLoading(false)
      return
    }

    const fetchCards = async () => {
      setLoading(true)
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`/api/cards/${encodeURIComponent(id)}`)
            if (!res.ok) return null
            const payload = (await res.json()) as Partial<CreditCard>
            if (!payload.id || !payload.card_name || !payload.card_type) return null
            return payload as CreditCard
          })
        )

        const resolved = results.filter((item): item is CreditCard => Boolean(item))
        setCards(resolved)

        if (resolved.length >= 2) {
          void trackInteraction('compare_completed', {
            page: '/cards/compare',
            entityType: 'card_compare',
            metadata: {
              comparedCardIds: resolved.map((card) => card.id),
              comparedCount: resolved.length,
            },
          })
        }
      } catch {
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    void trackInteraction('compare_started', {
      page: '/cards/compare',
      entityType: 'card_compare',
      metadata: { comparedCardIds: ids, comparedCount: ids.length },
    })

    fetchCards()
  }, [comparedCardIds, comparedCards, hasHydrated])

  const count = cards.length
  const gridTemplate = useMemo(
    () => ({ gridTemplateColumns: `180px repeat(${count}, minmax(0, 1fr))` }),
    [count]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-72 shimmer rounded-lg" />
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    )
  }

  if (count < 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <GitCompare className="h-12 w-12 text-muted-foreground/35" />
        <p className="text-muted-foreground">Select at least 2 cards to compare.</p>
        <Button asChild className="cardsense-btn-primary">
          <Link href="/cards">Browse Cards</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/cards">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Card Comparison</h1>
            <p className="text-sm text-muted-foreground">
              Comparing {count} cards side-by-side
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => {
            clearComparison()
            router.push('/cards')
          }}
        >
          <GitCompare className="h-3.5 w-3.5" />
          Change Cards
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card-premium overflow-x-auto overflow-hidden"
      >
        <div className="grid border-b border-border/30 bg-gradient-to-b from-[#fdf3d7]/20 to-transparent" style={gridTemplate}>
          <div className="flex items-end px-4 pb-4 pt-5">
            <span className="text-xs text-muted-foreground">Cards</span>
          </div>
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col items-center gap-2 border-l border-border/20 px-4 pb-4 pt-5">
              <CreditCardVisual
                cardId={card.id}
                size="sm"
                bankName={card.bank_name}
                cardName={card.card_name}
                interactive
              />
              <div className="text-center">
                <p className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
                  {card.bank_name}
                </p>
                <p className="text-sm font-semibold text-foreground leading-tight">{card.card_name}</p>
                <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                  <Badge variant="outline" className="border-[#d4a017]/40 text-[0.55rem] text-[#b8860b]">
                    {formatCardType(card.card_type)}
                  </Badge>
                  <Badge variant="secondary" className="text-[0.55rem]">
                    {card.card_network.toUpperCase()}
                  </Badge>
                </div>
              </div>
              {card.apply_url && (
                <Button size="sm" variant="outline" className="h-7 gap-1 text-[0.65rem]" asChild>
                  <a href={card.apply_url} target="_blank" rel="noopener noreferrer">
                    Apply
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="grid border-b border-border/20 bg-[#fdf3d7]/35" style={gridTemplate}>
          <div className="px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-[#b8860b]">
            Fees
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 0)} className="border-l border-border/20" />
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Joining Fee
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 1)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              <span className="font-semibold">{formatFee(card.joining_fee)}</span>
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Annual Fee
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 2)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5 text-center">
              <div>
                <span className="font-semibold">{formatFee(card.annual_fee)}</span>
                {card.annual_fee_waiver_spend && card.annual_fee_waiver_spend > 0 && (
                  <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                    Waiver @ {formatCurrency(card.annual_fee_waiver_spend, { compact: true, showDecimals: false })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Forex Markup
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 3)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              {card.forex_markup !== null ? (
                <span className={cn('font-semibold', card.forex_markup === 0 ? 'text-emerald-600' : '')}>
                  {card.forex_markup}%
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          ))}
        </div>

        <div className="grid border-b border-border/20 bg-[#fdf3d7]/35" style={gridTemplate}>
          <div className="px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-[#b8860b]">
            Rewards & Benefits
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 4)} className="border-l border-border/20" />
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Base Reward Rate
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 5)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-[#b8860b]" />
                <span className="font-semibold">{card.reward_rate_default}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Lounge Access
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 6)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5 text-center">
              <span className={cn('font-medium capitalize', card.lounge_access === 'none' ? 'text-muted-foreground' : 'text-[#b8860b]')}>
                {card.lounge_access === 'none' ? '-' : card.lounge_access}
              </span>
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Fuel Waiver
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 7)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              <BoolCell value={card.fuel_surcharge_waiver} />
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Golf Access
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 8)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              <BoolCell value={card.golf_access} />
            </div>
          ))}
        </div>

        <div className="grid border-b border-border/20 bg-[#fdf3d7]/35" style={gridTemplate}>
          <div className="px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-[#b8860b]">
            Eligibility
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 9)} className="border-l border-border/20" />
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Min CIBIL Score
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 10)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              <span className="font-semibold">{card.min_cibil_score}</span>
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Min Income (Salaried)
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 11)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              {card.min_income_salaried ? (
                <span className="font-semibold">
                  {formatCurrency(card.min_income_salaried, { compact: true, showDecimals: false })}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Age Requirement
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 12)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              <span className="font-semibold">
                {card.min_age}-{card.max_age} yrs
              </span>
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-center bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            ITR Required
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 13)} className="flex items-center justify-center border-l border-border/20 px-4 py-3.5">
              <BoolCell value={card.requires_itr} />
            </div>
          ))}
        </div>

        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-start bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Pros
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 14)} className="border-l border-border/20 px-4 py-3.5">
              <ul className="space-y-1">
                {(card.pros || []).slice(0, 4).map((point, index) => (
                  <li key={withKey(card.id, index)} className="flex items-start gap-1.5 text-xs">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="grid border-b border-border/20" style={gridTemplate}>
          <div className="flex items-start bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Cons
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 15)} className="border-l border-border/20 px-4 py-3.5">
              <ul className="space-y-1">
                {(card.cons || []).slice(0, 4).map((point, index) => (
                  <li key={withKey(card.id, index + 20)} className="flex items-start gap-1.5 text-xs">
                    <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="grid" style={gridTemplate}>
          <div className="flex items-start bg-muted/20 px-4 py-3.5 text-xs font-medium text-muted-foreground">
            Best For
          </div>
          {cards.map((card) => (
            <div key={withKey(card.id, 16)} className="border-l border-border/20 px-4 py-3.5">
              <div className="flex flex-wrap gap-1">
                {(card.best_for || []).map((tag, index) => (
                  <Badge key={withKey(card.id, index + 40)} variant="secondary" className="rounded-full text-[0.55rem]">
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className={cn('grid gap-4', count === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {cards.map((card) => (
          <div key={card.id} className="stat-card-premium space-y-3 p-4">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {card.bank_name} · {card.card_name}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatFee(card.annual_fee)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/ year</span>
            </p>
            <div className="flex gap-2">
              {card.apply_url && (
                <Button size="sm" className="cardsense-btn-primary flex-1 gap-1.5" asChild>
                  <a href={card.apply_url} target="_blank" rel="noopener noreferrer">
                    Apply
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/cards/${card.id}`}>Details</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
