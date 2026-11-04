'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BackLink } from '@/components/shared/back-link'
import { Button } from '@/components/ui/button'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { EmptyState } from '@/components/shared/empty-state'
import { useAnalysisStore } from '@/store/use-analysis-store'
import type { CreditCard } from '@/types/credit-card'
import { formatCurrency } from '@/lib/utils/format-currency'
import { trackInteraction } from '@/lib/interactions/client'
import { cn } from '@/lib/utils'

const fee = (value: number) => (value === 0 ? 'Free' : formatCurrency(value, { showDecimals: false }))
const lakh = (value: number) => formatCurrency(value, { compact: true, showDecimals: false })
const yesNo = (value: boolean | null) => (value === null ? '—' : value ? 'Yes' : 'No')

type Row = [label: string, value: (card: CreditCard) => React.ReactNode]

const GROUPS: Array<{ title: string; rows: Row[] }> = [
  {
    title: 'Fees',
    rows: [
      ['Joining', (c) => fee(c.joining_fee)],
      ['Annual', (c) => fee(c.annual_fee)],
      ['Waived at', (c) => (c.annual_fee_waiver_spend ? `${lakh(c.annual_fee_waiver_spend)} spend` : '—')],
      ['Forex markup', (c) => (c.forex_markup !== null ? `${c.forex_markup}%` : '—')],
    ],
  },
  {
    title: 'Rewards',
    rows: [
      ['Base', (c) => (c.reward_rate_default > 0 ? `${c.reward_rate_default}%` : '—')],
      ['Lounge', (c) => (c.lounge_access === 'none' ? '—' : <span className="capitalize">{c.lounge_access.replace(/_/g, ' ')}</span>)],
      ['Fuel waiver', (c) => yesNo(c.fuel_surcharge_waiver)],
      ['Golf', (c) => yesNo(c.golf_access)],
    ],
  },
  {
    title: 'Eligibility',
    rows: [
      ['CIBIL score', (c) => (c.min_cibil_score > 0 ? c.min_cibil_score : '—')],
      ['Income, salaried', (c) => (c.min_income_salaried ? lakh(c.min_income_salaried) : '—')],
      ['Age', (c) => `${c.min_age}–${c.max_age}`],
      ['ITR required', (c) => yesNo(c.requires_itr)],
    ],
  },
]

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

  if (loading) {
    return <div className="h-96 shimmer rounded-xl" aria-busy="true" />
  }

  if (count < 2) {
    return <EmptyState title="Pick two or more cards" actionLabel="Browse cards" actionHref="/cards" />
  }

  return (
    <div>
      <BackLink href="/cards">All cards</BackLink>
      <h1 className="sr-only">Compare cards</h1>

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-0 text-sm">
          <colgroup>
            <col className="w-36 sm:w-44" />
            {cards.map((card) => (
              <col key={card.id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 bg-background pb-6 text-left align-top font-normal">
                <button
                  type="button"
                  onClick={() => {
                    clearComparison()
                    router.push('/cards')
                  }}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Clear
                </button>
              </th>
              {cards.map((card) => (
                <th key={card.id} scope="col" className="px-3 pb-6 text-left align-bottom font-normal">
                  <Link href={`/cards/${card.id}`} className="block">
                    <CreditCardVisual
                      cardId={card.id}
                      cardSlug={card.card_slug}
                      size="sm"
                      bankName={card.bank_name}
                      cardName={card.card_name}
                      network={card.card_network}
                      imageUrl={card.image_url}
                      className="w-full max-w-[220px]"
                    />
                    <span className="mt-3 block font-medium">{card.card_name}</span>
                    <span className="block text-muted-foreground">{card.bank_name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => (
              <Fragment key={group.title}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={count + 1}
                    className="px-1 pb-2 pt-8 text-left text-[15px] font-semibold"
                  >
                    {group.title}
                  </th>
                </tr>
                {group.rows.map(([label, value], i) => (
                  // Each group reads as one white panel: round its outer corners, no lines inside.
                  <tr
                    key={label}
                    className={cn(
                      '[&>*]:bg-white',
                      i === 0 && '[&>:first-child]:rounded-tl-2xl [&>:last-child]:rounded-tr-2xl [&>*]:pt-3.5',
                      i === group.rows.length - 1 && '[&>:first-child]:rounded-bl-2xl [&>:last-child]:rounded-br-2xl [&>*]:pb-3.5'
                    )}
                  >
                    <th scope="row" className="sticky left-0 py-2 pl-5 pr-3 text-left font-normal text-muted-foreground">
                      {label}
                    </th>
                    {cards.map((card) => (
                      <td key={card.id} className="px-3 py-2 tabular-nums">
                        {value(card)}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr>
              <td className="sticky left-0 bg-background" />
              {cards.map((card) => (
                <td key={card.id} className="px-3 pt-6">
                  {card.apply_url && (
                    <Button size="sm" asChild>
                      <a href={card.apply_url} target="_blank" rel="noopener noreferrer">
                        Apply
                      </a>
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
