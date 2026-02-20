'use client'

import { useEffect, useState } from 'react'
import { useAnalysisStore } from '@/store/use-analysis-store'
import { useRouter } from 'next/navigation'
import type { CreditCard } from '@/types/credit-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  TrendingUp,
  Award,
  Shield,
  DollarSign,
  GitCompare,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format-currency'
import { cn } from '@/lib/utils'

/* ─── Row component ──────────────────────────── */
function CompareRow({
  label,
  values,
  highlight,
}: {
  label: string
  values: React.ReactNode[]
  highlight?: 'best' | 'none'
}) {
  return (
    <div className="grid border-b border-border/20 last:border-0" style={{ gridTemplateColumns: `180px repeat(${values.length}, 1fr)` }}>
      {/* Label */}
      <div className="flex items-center px-4 py-3.5 text-xs font-medium text-muted-foreground bg-muted/20">
        {label}
      </div>
      {/* Values */}
      {values.map((v, i) => (
        <div key={i} className="flex items-center justify-center px-4 py-3.5 text-sm text-center border-l border-border/20">
          {v}
        </div>
      ))}
    </div>
  )
}

/* ─── Bool cell ─────────────────────────────── */
function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="h-4 w-4 text-green-600" />
  ) : (
    <XCircle className="h-4 w-4 text-muted-foreground/40" />
  )
}

/* ─── Section header ────────────────────────── */
function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      className="grid items-center bg-gradient-to-r from-[#fdf3d7]/40 to-transparent"
      style={{ gridTemplateColumns: `180px repeat(${count}, 1fr)` }}
    >
      <div className="px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-[#b8860b]">
        {label}
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-l border-border/20" />
      ))}
    </div>
  )
}

/* ─── Main page ─────────────────────────────── */
export default function CardComparePage() {
  const router = useRouter()
  const { comparedCardIds, clearComparison } = useAnalysisStore()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (comparedCardIds.length < 2) {
      router.replace('/cards')
      return
    }

    const fetchCards = async () => {
      setLoading(true)
      try {
        const results = await Promise.all(
          comparedCardIds.map((id) =>
            fetch(`/api/cards/${id}`).then((r) => r.json())
          )
        )
        setCards(results.filter(Boolean))
      } catch {
        router.replace('/cards')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [comparedCardIds, router])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 shimmer rounded-lg" />
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    )
  }

  if (cards.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <GitCompare className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Select at least 2 cards to compare.</p>
        <Button asChild className="cardsense-btn-primary">
          <Link href="/cards">Browse Cards</Link>
        </Button>
      </div>
    )
  }

  const formatFee = (fee: number) => (fee === 0 ? 'Free' : formatCurrency(fee, { showDecimals: false }))
  const formatCardType = (type: string) =>
    type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const n = cards.length

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/cards">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Card Comparison</h1>
            <p className="text-sm text-muted-foreground">
              Comparing {n} card{n > 1 ? 's' : ''} side-by-side
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            clearComparison()
            router.push('/cards')
          }}
          className="gap-1.5 text-xs"
        >
          <GitCompare className="h-3.5 w-3.5" />
          Change Cards
        </Button>
      </div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card-premium overflow-hidden overflow-x-auto"
      >
        {/* Card header row */}
        <div
          className="grid border-b border-border/30 bg-gradient-to-b from-[#fdf3d7]/20 to-transparent"
          style={{ gridTemplateColumns: `180px repeat(${n}, 1fr)` }}
        >
          <div className="flex items-end px-4 pb-4 pt-5">
            <span className="text-xs text-muted-foreground">Cards</span>
          </div>
          {cards.map((card) => (
            <div key={card.id} className="flex flex-col items-center gap-2 border-l border-border/20 px-4 pb-4 pt-5">
              <CreditCardVisual cardId={card.id} size="sm" bankName={card.bank_name} cardName={card.card_name} interactive />
              <div className="text-center">
                <p className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
                  {card.bank_name}
                </p>
                <p className="text-sm font-semibold text-foreground leading-tight">{card.card_name}</p>
                <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                  <Badge variant="outline" className="border-violet-200/60 text-[0.55rem] text-violet-700">
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
                    Apply <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* ── Fees ── */}
        <SectionHeader label="Fees" count={n} />
        <CompareRow
          label="Joining Fee"
          values={cards.map((c) => <span className="font-semibold">{formatFee(c.joining_fee)}</span>)}
        />
        <CompareRow
          label="Annual Fee"
          values={cards.map((c) => (
            <div className="text-center">
              <span className="font-semibold">{formatFee(c.annual_fee)}</span>
              {c.annual_fee_waiver_spend && c.annual_fee_waiver_spend > 0 && (
                <p className="text-[0.6rem] text-muted-foreground mt-0.5">
                  Waiver @ {formatCurrency(c.annual_fee_waiver_spend, { compact: true, showDecimals: false })}
                </p>
              )}
            </div>
          ))}
        />
        <CompareRow
          label="Forex Markup"
          values={cards.map((c) => (
            c.forex_markup != null
              ? <span className={cn('font-semibold', c.forex_markup === 0 ? 'text-green-600' : '')}>{c.forex_markup}%</span>
              : <span className="text-muted-foreground">—</span>
          ))}
        />

        {/* ── Rewards ── */}
        <SectionHeader label="Rewards" count={n} />
        <CompareRow
          label="Base Reward Rate"
          values={cards.map((c) => (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-violet-600" />
              <span className="font-semibold">{c.reward_rate_default}%</span>
            </div>
          ))}
        />

        {/* ── Benefits ── */}
        <SectionHeader label="Benefits" count={n} />
        <CompareRow
          label="Lounge Access"
          values={cards.map((c) => (
            <div className="text-center">
              <span className={cn('font-medium capitalize', c.lounge_access === 'none' ? 'text-muted-foreground' : 'text-amber-700')}>
                {c.lounge_access === 'none' ? '—' : c.lounge_access}
              </span>
              {c.lounge_visits_per_quarter > 0 && (
                <p className="text-[0.6rem] text-muted-foreground mt-0.5">
                  {c.lounge_visits_per_quarter}x / quarter
                </p>
              )}
            </div>
          ))}
        />
        <CompareRow
          label="Fuel Waiver"
          values={cards.map((c) => <BoolCell value={c.fuel_surcharge_waiver} />)}
        />
        <CompareRow
          label="Golf Access"
          values={cards.map((c) => <BoolCell value={c.golf_access} />)}
        />
        <CompareRow
          label="Concierge"
          values={cards.map((c) => <BoolCell value={c.concierge_service} />)}
        />
        <CompareRow
          label="EMI Conversion"
          values={cards.map((c) => <BoolCell value={c.emi_conversion_available} />)}
        />
        {cards.some((c) => c.travel_insurance_cover && c.travel_insurance_cover > 0) && (
          <CompareRow
            label="Travel Insurance"
            values={cards.map((c) => (
              c.travel_insurance_cover && c.travel_insurance_cover > 0
                ? <span className="font-medium text-green-700">{formatCurrency(c.travel_insurance_cover, { compact: true, showDecimals: false })}</span>
                : <XCircle className="h-4 w-4 text-muted-foreground/40" />
            ))}
          />
        )}

        {/* ── Eligibility ── */}
        <SectionHeader label="Eligibility" count={n} />
        <CompareRow
          label="Min CIBIL Score"
          values={cards.map((c) => <span className="font-semibold">{c.min_cibil_score}</span>)}
        />
        <CompareRow
          label="Min Income (Salaried)"
          values={cards.map((c) => (
            c.min_income_salaried
              ? <span className="font-semibold">{formatCurrency(c.min_income_salaried, { compact: true, showDecimals: false })}</span>
              : <span className="text-muted-foreground">—</span>
          ))}
        />
        <CompareRow
          label="Age Requirement"
          values={cards.map((c) => <span className="font-semibold">{c.min_age}–{c.max_age} yrs</span>)}
        />
        <CompareRow
          label="ITR Required"
          values={cards.map((c) => <BoolCell value={c.requires_itr} />)}
        />

        {/* ── Pros & Cons ── */}
        <SectionHeader label="Pros & Cons" count={n} />
        <div
          className="grid border-b border-border/20"
          style={{ gridTemplateColumns: `180px repeat(${n}, 1fr)` }}
        >
          <div className="flex items-start px-4 py-3.5 text-xs font-medium text-muted-foreground bg-muted/20">
            Pros
          </div>
          {cards.map((c) => (
            <div key={c.id} className="border-l border-border/20 px-4 py-3.5">
              <ul className="space-y-1">
                {c.pros?.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600 mt-0.5" />
                    <span className="text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="grid border-b border-border/20"
          style={{ gridTemplateColumns: `180px repeat(${n}, 1fr)` }}
        >
          <div className="flex items-start px-4 py-3.5 text-xs font-medium text-muted-foreground bg-muted/20">
            Cons
          </div>
          {cards.map((c) => (
            <div key={c.id} className="border-l border-border/20 px-4 py-3.5">
              <ul className="space-y-1">
                {c.cons?.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <XCircle className="h-3 w-3 shrink-0 text-red-500 mt-0.5" />
                    <span className="text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Best For ── */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `180px repeat(${n}, 1fr)` }}
        >
          <div className="flex items-start px-4 py-3.5 text-xs font-medium text-muted-foreground bg-muted/20">
            Best For
          </div>
          {cards.map((c) => (
            <div key={c.id} className="border-l border-border/20 px-4 py-3.5">
              <div className="flex flex-wrap gap-1">
                {c.best_for?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full text-[0.55rem]">
                    {tag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Apply buttons row */}
      <div className={cn('grid gap-4', n === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {cards.map((card) => (
          <div key={card.id} className="stat-card-premium p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground truncate">
              {card.bank_name} &middot; {card.card_name}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatFee(card.annual_fee)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ year</span>
            </p>
            <div className="flex gap-2">
              {card.apply_url && (
                <Button size="sm" className="cardsense-btn-primary flex-1 gap-1.5" asChild>
                  <a href={card.apply_url} target="_blank" rel="noopener noreferrer">
                    Apply Now <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/cards/${card.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
