'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAdvisorStore } from '@/lib/store/advisor-store'

export interface DashboardTopPick {
  cardId: string
  cardName: string
  bank: string
  score?: number
}

interface DashboardTopPicksProps {
  cards: DashboardTopPick[]
}

export function DashboardTopPicks({ cards: initialCards }: DashboardTopPicksProps) {
  const [cards, setCards] = useState(initialCards)

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

    if (useAdvisorStore.persist.hasHydrated()) {
      hydrateFromSavedResult()
    } else {
      return useAdvisorStore.persist.onFinishHydration(hydrateFromSavedResult)
    }
  }, [initialCards.length])

  return (
    <div className="px-1 py-2 lg:border-r lg:border-border/50 lg:pr-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Top Picks</p>
        <CheckCircle2 className="h-4 w-4 text-[#b8860b]" strokeWidth={1.7} />
      </div>
      <div className="mt-3 space-y-2">
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <Link key={card.cardId || `${card.cardName}-${index}`} href="/recommendations" className="group block truncate text-xs font-medium text-foreground hover:text-[#b8860b]">
              <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>{card.cardName}
              {card.bank && <span className="ml-1 text-[0.65rem] font-normal text-muted-foreground">· {card.bank}</span>}
            </Link>
          ))
        ) : (
          <div>
            <p className="text-xs text-muted-foreground">No recommendations yet</p>
            <Link href="/advisor" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#b8860b] hover:text-[#8d6500]">
              Take the advisor <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
