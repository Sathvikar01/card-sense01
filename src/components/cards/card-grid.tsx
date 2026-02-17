import { CardTile } from './card-tile'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { CreditCardListItem } from '@/types/credit-card'

interface CardGridProps {
  cards: CreditCardListItem[]
  loading: boolean
}

export function CardGrid({ cards, loading }: CardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-xl border border-border/60 p-5">
            <Skeleton className="mx-auto h-[126px] w-[200px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        title="No cards found"
        description="Try adjusting your search or filters to find more credit cards."
      />
    )
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {cards.length} {cards.length === 1 ? 'card' : 'cards'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <CardTile key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
