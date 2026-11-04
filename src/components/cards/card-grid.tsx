'use client'

import { CardTile } from './card-tile'
import { EmptyState } from '@/components/shared/empty-state'
import type { CreditCardListItem } from '@/types/credit-card'

const GRID = 'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2'

export function CardGrid({ cards, loading }: { cards: CreditCardListItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className={GRID} aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[1.586] w-full shimmer rounded-xl" />
            <div className="h-4 w-2/3 shimmer" />
            <div className="h-3 w-1/3 shimmer" />
          </div>
        ))}
      </div>
    )
  }

  if (cards.length === 0) return <EmptyState title="No cards match" />

  return (
    <div className={GRID}>
      {cards.map((card) => (
        <CardTile key={card.id} card={card} />
      ))}
    </div>
  )
}
