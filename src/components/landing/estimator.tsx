'use client'

import { useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SPEND_CATEGORIES, rankCards, type SpendCategory } from './hero-cards'
import { EDGE } from './hero'

const inr = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`

/** Where each rank stands on the stage, in the stage's 460×340 coordinates. */
const PLACES = [
  { x: 0, y: 76, rotate: -6, scale: 1, zIndex: 2 },
  { x: 92, y: -4, rotate: 5, scale: 0.9, zIndex: 1 },
]

/**
 * The page's one live thing: set your biggest spend and the two cards that return the most
 * trade places on the stage. Rates come from hero-cards.ts, shared with the iOS app.
 */
export function Estimator({ onStart }: { onStart: () => void }) {
  const [category, setCategory] = useState<SpendCategory>('online')
  const [monthly, setMonthly] = useState(25000)
  const sliderId = useId()
  const ranked = useMemo(() => rankCards(category, monthly), [category, monthly])
  const [best] = ranked

  return (
    <section aria-labelledby="estimator-heading" className="overflow-x-clip py-20 sm:py-28" style={{ paddingInline: EDGE }}>
      {/* Phones: heading, stage, controls, so the cards stay in view while you pick. Wide: controls left, stage right. */}
      <div className="grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-7">
        <h2 id="estimator-heading" className="text-3xl font-semibold tracking-tight sm:text-5xl lg:col-start-1 lg:row-start-1 lg:self-end">
          What would a card pay you?
        </h2>

        <div className="flex flex-col gap-7 lg:col-start-1 lg:row-start-2">

          <ToggleGroup
            type="single"
            aria-label="Your biggest spend"
            value={category}
            onValueChange={(value) => value && setCategory(value as SpendCategory)}
          >
            {SPEND_CATEGORIES.map((c) => (
              <ToggleGroupItem key={c.value} value={c.value}>
                {c.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex max-w-md flex-col gap-1">
            <label htmlFor={sliderId} className="flex items-baseline justify-between">
              <span>Each month</span>
              <span className="font-semibold tabular-nums">{inr(monthly)}</span>
            </label>
            <input
              id={sliderId}
              type="range"
              min={2000}
              max={100000}
              step={1000}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              aria-valuetext={`${inr(monthly)} a month`}
              className="h-11 w-full cursor-pointer accent-primary"
            />
          </div>

          <p aria-live="polite">
            <span className="block text-6xl font-semibold tracking-[-0.03em] tabular-nums">{inr(best.yearly)}</span>
            <span className="mt-2 block text-lg text-muted-foreground">
              a year back with {best.card.bank} {best.card.name}
            </span>
          </p>

          <Button size="lg" className="self-start" onClick={onStart}>
            Find my card
          </Button>
        </div>

        {/* Built at 400px card width; zoom keeps the chip, network mark and type in proportion. */}
        <div aria-hidden="true" className="row-start-2 flex justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:items-center lg:justify-end">
          <div className="relative h-[340px] w-[460px] shrink-0 [zoom:0.72] min-[400px]:[zoom:0.78] sm:[zoom:1.05] xl:[zoom:1.2]">
            <AnimatePresence initial={false}>
              {ranked.slice(0, 2).map(({ card }, rank) => (
                <motion.div
                  key={card.id}
                  className="absolute left-0 top-0 drop-shadow-[0_24px_32px_rgb(22_48_43/0.22)]"
                  initial={{ opacity: 0, x: 140, y: -40, rotate: 14, scale: 0.9 }}
                  animate={{ opacity: 1, ...PLACES[rank] }}
                  exit={{ opacity: 0, x: -60, y: 120, rotate: -16, transition: { duration: 0.3 } }}
                  transition={{ type: 'spring', bounce: 0.12, duration: 0.7 }}
                >
                  <CreditCardVisual cardId={card.id} size="lg" bankName={card.bank} cardName={card.name} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
