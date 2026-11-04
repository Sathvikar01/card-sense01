import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { rankCards, type SpendCategory } from './hero-cards'
import { EDGE } from './hero'

const inr = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`

/** Four everyday spenders. The card and figure for each come from rankCards, so they track the rates. */
const PEOPLE: Array<{ who: string; spend: string; category: SpendCategory; monthly: number }> = [
  { who: 'Orders food most nights', spend: 'on delivery', category: 'dining', monthly: 12000 },
  { who: 'Shops online every week', spend: 'online', category: 'online', monthly: 20000 },
  { who: 'Runs the family groceries', spend: 'on groceries', category: 'groceries', monthly: 15000 },
  { who: 'Drives to work', spend: 'on fuel', category: 'fuel', monthly: 8000 },
]

/**
 * Proof by example instead of a control: four kinds of spender, the card that suits each,
 * and what it pays back in a year after the fee. Nothing to set; the advisor does that.
 */
export function Examples() {
  return (
    <section aria-labelledby="examples-heading" className="pb-20 pt-10 sm:pb-28 sm:pt-16" style={{ paddingInline: EDGE }}>
      <h2 id="examples-heading" className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
        The right card is worth thousands a year.
      </h2>
      {/* Phones: a row you swipe, one example and the edge of the next in view. Wider: a grid. */}
      <ul className="-mx-4 mt-12 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {PEOPLE.map((person) => {
          const [best] = rankCards(person.category, person.monthly)
          return (
            <li key={person.category} className="flex w-[80%] shrink-0 snap-start flex-col sm:w-auto">
              <div role="img" aria-label={`${best.card.bank} ${best.card.name}`} className="drop-shadow-[0_14px_20px_rgb(22_48_43/0.16)] [zoom:0.92] sm:[zoom:1] lg:[zoom:0.82] xl:[zoom:0.84]">
                <CreditCardVisual cardId={best.card.id} size="md" bankName={best.card.bank} cardName={best.card.name} />
              </div>
              <p className="mt-7 text-lg font-medium">{person.who}</p>
              <p className="text-muted-foreground">
                {inr(person.monthly)} a month {person.spend}
              </p>
              <p className="mt-5 text-4xl font-semibold tracking-[-0.03em] tabular-nums">{inr(best.yearly)}</p>
              <p className="text-muted-foreground">a year back, after the fee</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
