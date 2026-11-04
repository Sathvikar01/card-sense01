import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { Button } from '@/components/ui/button'

/** The page's content edge: 16px on phones, the 72rem column's edge on wide screens. */
export const EDGE = 'max(1rem, calc((100% - 72rem) / 2 + 1.5rem))'

/** Two rows of real card art. Each row is listed twice so the loop has no seam. */
const ROWS = [
  ['hdfc-infinia', 'sbi-cashback', 'axis-ace', 'hdfc-millennia', 'sbi-simply-click', 'idfc-first-wow', 'icici-sapphiro', 'hdfc-swiggy', 'axis-atlas'],
  ['icici-amazon-pay', 'hdfc-regalia-gold', 'axis-magnus', 'rbl-shoprite', 'amex-plat-travel', 'idfc-first-classic', 'indusind-legend', 'au-lit', 'hdfc-diners-club-black'],
]

function CardRow({ ids, reverse }: { ids: string[]; reverse?: boolean }) {
  return (
    <div className="marquee-row">
      <ul className={`marquee-track ${reverse ? 'marquee-reverse' : ''}`}>
        {[...ids, ...ids].map((id, i) => (
          <li key={`${id}-${i}`} className="shrink-0 drop-shadow-[0_10px_14px_rgb(22_48_43/0.14)] [zoom:0.8] sm:[zoom:1]">
            <CreditCardVisual cardId={id} size="md" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Light, centred, and carried by the cards themselves: a headline of seven words with
 * its promise on a gold highlight, one sentence, two actions, then every major card
 * drifting past in two rows. The rows pause on hover and stand still for reduced motion.
 */
export function Hero({ onStart, onBrowse }: { onStart: () => void; onBrowse: () => void }) {
  return (
    <section className="overflow-x-clip pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <h1 className="text-balance text-[clamp(2.75rem,8vw,6rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          Find the card that{' '}
          <span className="relative isolate whitespace-nowrap">
            <span aria-hidden="true" className="absolute inset-x-[-0.08em] bottom-[0.06em] top-[0.52em] -z-10 -rotate-1 rounded-[0.12em] bg-accent" />
            pays you back.
          </span>
        </h1>
        <p className="mt-7 max-w-xl text-pretty text-lg text-muted-foreground sm:text-xl">
          Every major Indian credit card, ranked on fees, rewards and eligibility for the way you spend.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" onClick={onStart}>
            Find my card
          </Button>
          <Button size="lg" variant="outline" onClick={onBrowse}>
            Browse all cards
          </Button>
        </div>
      </div>

      <div aria-hidden="true" className="mt-10 flex flex-col sm:mt-14">
        <CardRow ids={ROWS[0]} />
        <CardRow ids={ROWS[1]} reverse />
      </div>
    </section>
  )
}
