'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAdvisorStore } from '@/lib/store/advisor-store'
import { Button } from '@/components/ui/button'
import { Empty, Section } from '@/components/shared/section'

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
    <Section title="Your matches" action={cards.length > 0 ? { label: 'View all', href: '/recommendations' } : undefined}>
      {cards.length === 0 ? (
        <Empty>
          <span className="flex-1">No matches yet</span>
          <Button asChild size="sm">
            <Link href="/advisor">Find my card</Link>
          </Button>
        </Empty>
      ) : (
        <ol>
          {cards.map((card, index) => (
            <li key={card.cardId || `${card.cardName}-${index}`}>
              <Link href="/recommendations" className="row">
                <span className="w-4 tabular-nums text-muted-foreground">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate font-medium">{card.cardName}</span>
                <span className="truncate text-sm text-muted-foreground">{card.bank}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}
