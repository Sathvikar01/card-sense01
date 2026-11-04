import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { rankCards, type SpendCategory } from './hero-cards'
import { EDGE } from './hero'

/** Four everyday spenders. Which card suits each comes from rankCards, so it tracks the rates. */
const PEOPLE: Array<{ who: string; category: SpendCategory; monthly: number }> = [
  { who: 'Orders food most nights', category: 'dining', monthly: 12000 },
  { who: 'Shops online every week', category: 'online', monthly: 20000 },
  { who: 'Runs the family groceries', category: 'groceries', monthly: 15000 },
  { who: 'Drives to work', category: 'fuel', monthly: 8000 },
]

/**
 * Proof by example, with no prices and nothing to set: four kinds of spender and the card
 * that suits each. Working with your own numbers is the advisor's job.
 */
export function Examples() {
  return (
    <section aria-labelledby="examples-heading" className="pb-20 pt-10 sm:pb-28 sm:pt-16" style={{ paddingInline: EDGE }}>
      <h2 id="examples-heading" className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
        A different card for every way you spend.
      </h2>
      {/* Phones: a row you swipe, one example and the edge of the next in view. Wider: a grid. */}
      <ul className="-mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {PEOPLE.map((person) => {
          const [best] = rankCards(person.category, person.monthly)
          return (
            <li key={person.category} className="flex w-[80%] shrink-0 snap-start flex-col sm:w-auto">
              <div aria-hidden="true" className="drop-shadow-[0_14px_20px_rgb(22_48_43/0.16)] [zoom:0.92] sm:[zoom:1] lg:[zoom:0.82] xl:[zoom:0.84]">
                <CreditCardVisual cardId={best.card.id} size="md" bankName={best.card.bank} cardName={best.card.name} />
              </div>
              <p className="mt-7 text-lg font-medium">{person.who}</p>
              <p className="text-muted-foreground">
                {best.card.bank} {best.card.name}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
