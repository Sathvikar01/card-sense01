'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAdvisorStore } from '@/lib/store/advisor-store'

export interface DashboardTopPick {
  cardId: string
  cardSlug?: string
  imageUrl?: string | null
  cardName: string
  bank: string
  score?: number
}

export function DashboardTopPicks({ cards: initialCards }: { cards: DashboardTopPick[] }) {
  const [cards, setCards] = useState(initialCards)

  // Fall back to the advisor result kept in local storage when nothing is saved server-side.
  useEffect(() => {
    if (initialCards.length > 0) return

    const hydrateFromSavedResult = () => {
      const saved = useAdvisorStore.getState().savedResult
      if (!saved?.cards?.length) return
      setCards(
        saved.cards.slice(0, 3).map((card) => ({
          cardId: card.id,
          cardName: card.name,
          bank: card.bank,
          score: card.score,
        }))
      )
    }

    if (useAdvisorStore.persist.hasHydrated()) hydrateFromSavedResult()
    else return useAdvisorStore.persist.onFinishHydration(hydrateFromSavedResult)
  }, [initialCards.length])

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Your matches</h2>
        {cards.length > 0 && (
          <Link href="/recommendations" className="text-sm text-muted-foreground hover:text-foreground">
            View all
          </Link>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="surface px-5 py-10 text-center text-sm text-muted-foreground">No matches yet</div>
      ) : (
        <ol className="surface divide-y divide-border">
          {cards.map((card, index) => (
            <li key={card.cardId || `${card.cardName}-${index}`}>
              <Link href="/recommendations" className="flex items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-muted/50">
                <span className="w-4 tabular-nums text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{card.cardName}</span>
                <span className="truncate text-muted-foreground">{card.bank}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
