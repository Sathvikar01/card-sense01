'use client'

import { CardTile } from './card-tile'
import { Button } from '@/components/ui/button'
import type { CreditCardListItem } from '@/types/credit-card'
import { Skeleton } from '@/components/ui/skeleton'

const GRID = 'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2'

interface CardGridProps {
  cards: CreditCardListItem[]
  loading: boolean
  failed: boolean
  query: string
  hasFilters: boolean
  onClear: () => void
}

/** Every data region has four states: loading, error, empty and full. */
export function CardGrid({ cards, loading, failed, query, hasFilters, onClear }: CardGridProps) {
  if (loading) {
    return (
      <div className={GRID} aria-busy="true" aria-label="Loading cards">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-[1.586] w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (failed) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 py-6">
        <p>Unable to load cards. Check your connection and try again.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 py-6">
        <p className="text-muted-foreground">
          {query ? `No cards match “${query}”.` : 'No cards match these filters.'}
        </p>
        {(query || hasFilters) && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <ul className={GRID}>
      {cards.map((card) => (
        <li key={card.id}>
          <CardTile card={card} />
        </li>
      ))}
    </ul>
  )
}
