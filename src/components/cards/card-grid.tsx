'use client'

import { CardTile } from './card-tile'
import { EmptyState } from '@/components/shared/empty-state'
import type { CreditCardListItem } from '@/types/credit-card'
import { motion } from 'framer-motion'

interface CardGridProps {
  cards: CreditCardListItem[]
  loading: boolean
}

export function CardGrid({ cards, loading }: CardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="stat-card-premium space-y-4 p-5">
            <div className="mx-auto h-[126px] w-[200px] shimmer rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 w-1/3 shimmer rounded" />
              <div className="h-5 w-3/4 shimmer rounded" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full shimmer rounded" />
              <div className="h-4 w-2/3 shimmer rounded" />
            </div>
            <div className="h-9 w-full shimmer rounded-xl" />
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
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{cards.length}</span> {cards.length === 1 ? 'card' : 'cards'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
          >
            <CardTile card={card} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
