'use client'

import { useId, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SPEND_CATEGORIES, rankCards, type SpendCategory } from './hero-cards'

/** The page's content edge: 16px on phones, the 72rem column's edge on wide screens. */
export const EDGE = 'max(1rem, calc((100% - 72rem) / 2 + 1.5rem))'

const inr = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`

/** Where each rank stands on the stage, in the stage's 460×340 coordinates. */
const PLACES = [
  { x: 0, y: 76, rotate: -7, scale: 1, zIndex: 2 },
  { x: 92, y: -4, rotate: 6, scale: 0.9, zIndex: 1 },
]

/**
 * Taste v2 "The object, large", with the estimator as the page's one live thing.
 * The stage holds the two best cards for the spend you set: the winner in front, the
 * runner-up behind it. When the ranking changes the cards trade places instead of cutting.
 */
export function Hero({ onStart }: { onStart: () => void }) {
  const [category, setCategory] = useState<SpendCategory>('online')
  const [monthly, setMonthly] = useState(25000)
  const sliderId = useId()
  const ranked = useMemo(() => rankCards(category, monthly), [category, monthly])
  const [best, second] = ranked

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-24 lg:flex lg:min-h-[max(100svh,760px)] lg:flex-col lg:pb-20 lg:pt-32" style={{ paddingInline: EDGE }}>
      <h1 className="text-[clamp(3.5rem,15vw,6rem)] font-semibold leading-[0.9] tracking-[-0.05em] lg:whitespace-nowrap lg:text-[min(9.4vw,8.5rem)]">
        Pay yourself <br className="lg:hidden" />
        back.
      </h1>

      <div className="mt-10 flex flex-col gap-12 lg:mt-auto lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
        {/* The stage. Above the controls on phones; beside them on wide screens, free to run past the right edge. */}
        <div aria-hidden="true" className="relative flex justify-center lg:order-2 lg:col-span-6 lg:justify-start lg:pl-4">
          {/* Built at 400px card width; zoom keeps the chip, network mark and type in proportion. */}
          <div className="relative h-[340px] w-[460px] shrink-0 [zoom:0.72] min-[400px]:[zoom:0.78] sm:[zoom:1.1] lg:[zoom:1.2] xl:[zoom:1.4]">
            <AnimatePresence initial={false}>
              {ranked.slice(0, 2).map(({ card }, rank) => (
                <motion.div
                  key={card.id}
                  className="absolute left-0 top-0 origin-center drop-shadow-[0_28px_36px_rgb(0_0_0/0.42)]"
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

        {/* The controls: small and precise, opposite the object. */}
        <div className="flex flex-col gap-6 lg:order-1 lg:col-span-6 lg:max-w-lg">
          <p className="max-w-sm text-lg">Pick your biggest spend. The card that pays you most comes to the front.</p>

          <ToggleGroup
            type="single"
            variant="field"
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

          <div className="flex flex-col gap-1">
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
              className="h-11 w-full cursor-pointer accent-accent"
            />
          </div>

          <div aria-live="polite" className="flex items-end justify-between gap-6">
            <p>
              <span className="block text-5xl font-semibold tracking-tight tabular-nums text-accent">{inr(best.yearly)}</span>
              <span className="mt-2 block">
                a year with {best.card.bank} {best.card.name}
              </span>
            </p>
            <p className="shrink-0 pb-0.5 text-right text-sm">
              <span className="block tabular-nums">{inr(second.yearly)}</span>
              <span className="block">{second.card.name}</span>
            </p>
          </div>

          <Button size="lg" variant="accent" className="self-start" onClick={onStart}>
            Find my card
          </Button>
        </div>
      </div>
    </section>
  )
}
