import { createPublicServerClient } from '@/lib/supabase/public-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { formatCurrency } from '@/lib/utils/format-currency'
import type { CreditCard } from '@/types/credit-card'
import { isUuid } from '@/lib/cards/card-mappers'

interface PageProps {
  params: Promise<{ id: string }>
}

interface CardQueryResult {
  data: Record<string, unknown> | null
  error: { message?: string; code?: string } | null
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id: rawId } = await params
  const id = decodeURIComponent(rawId)

  const supabase = createPublicServerClient()
  const createCardQuery = () => supabase.from('credit_cards').select('*').eq('is_active', true)
  const initialResult = (await (isUuid(id)
    ? createCardQuery().eq('id', id).maybeSingle()
    : createCardQuery().eq('card_slug', id).maybeSingle())) as CardQueryResult
  const { data: card, error } = !initialResult.error && !initialResult.data && !isUuid(id)
    ? (await createCardQuery().ilike('card_name', id).limit(1).maybeSingle()) as CardQueryResult
    : initialResult

  if (error || !card) notFound()

  return <CardDetailContent cardData={card as unknown as CreditCard} />
}

function CardDetailContent({ cardData }: { cardData: CreditCard }) {
  const formatCardType = (type: string) => type.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  const formatFee = (fee: number) => fee === 0 ? 'Free' : formatCurrency(fee, { showDecimals: false })

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <Link href="/cards" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to cards
      </Link>

      <section className="grid gap-10 border-b border-border pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div className="flex justify-center lg:justify-start">
          <CreditCardVisual
            cardId={cardData.id}
            cardSlug={cardData.card_slug}
            size="lg"
            cardName={cardData.card_name}
            bankName={cardData.bank_name}
            network={cardData.card_network}
            imageUrl={cardData.image_url}
            interactive
          />
        </div>

        <div className="space-y-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{cardData.bank_name}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">{cardData.card_name}</h1>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span>{formatCardType(cardData.card_type)}</span>
              <span aria-hidden="true">·</span>
              <span>{cardData.card_network.toUpperCase()}</span>
              {cardData.popularity_score >= 90 && <span className="font-semibold text-[#a87500]">Popular choice</span>}
            </div>
          </div>

          {cardData.description && <p className="max-w-xl text-base leading-7 text-muted-foreground">{cardData.description}</p>}

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-5 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Joining fee</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatFee(cardData.joining_fee)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Annual fee</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatFee(cardData.annual_fee)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Base return</dt>
              <dd className="mt-1 font-semibold text-foreground">{cardData.reward_rate_default > 0 ? `${cardData.reward_rate_default}%` : 'Issuer rules'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Min. income</dt>
              <dd className="mt-1 font-semibold text-foreground">{cardData.min_income_salaried ? formatCurrency(cardData.min_income_salaried, { compact: true, showDecimals: false }) : 'Not listed'}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-4">
            {cardData.apply_url && (
              <Button size="lg" asChild>
                <a href={cardData.apply_url} target="_blank" rel="noopener noreferrer">
                  Apply on issuer site
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            {cardData.annual_fee_waiver_spend && cardData.annual_fee_waiver_spend > 0 && (
              <p className="text-xs leading-5 text-muted-foreground">Annual fee waived at {formatCurrency(cardData.annual_fee_waiver_spend, { showDecimals: false })} spend.</p>
            )}
          </div>
        </div>
      </section>

      <div className="card-detail-sections w-full space-y-12">
        <section aria-label="Overview" className="space-y-10">
          <div className="grid gap-10 md:grid-cols-2">
            {cardData.pros && cardData.pros.length > 0 && (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">What works</p>
                <ul className="mt-5 space-y-4">
                  {cardData.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm leading-6 text-foreground/80">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {cardData.cons && cardData.cons.length > 0 && (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Worth knowing</p>
                <ul className="mt-5 space-y-4">
                  {cardData.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm leading-6 text-foreground/80">
                      <XCircle className="mt-1 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          {cardData.best_for && cardData.best_for.length > 0 && (
            <section className="border-t border-border pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best for</p>
              <p className="mt-3 max-w-3xl text-base leading-7 text-foreground/80">{cardData.best_for.map((tag) => tag.replace(/_/g, ' ')).join(' · ')}</p>
            </section>
          )}
        </section>

        <section aria-label="Rewards" className="space-y-10 border-t border-border pt-10">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Rewards</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">How the return is built</h2>
            <dl className="mt-7 divide-y divide-border border-y border-border">
              <div className="flex items-center justify-between gap-6 py-4"><dt className="text-sm text-muted-foreground">Estimated base return</dt><dd className="font-semibold text-foreground">{cardData.reward_rate_default > 0 ? `${cardData.reward_rate_default}%` : 'Not published'}</dd></div>
              {cardData.reward_rate_categories && Object.entries(cardData.reward_rate_categories).map(([category, reward]) => (
                <div key={category} className="flex items-center justify-between gap-6 py-4"><dt className="text-sm capitalize text-muted-foreground">{category.replace(/_/g, ' ')}</dt><dd className="font-semibold text-foreground">{reward.rate} {reward.unit === 'points_per_100' ? 'pts / ₹100' : reward.unit === 'percent_cashback' ? '% cashback' : '% waiver'}</dd></div>
              ))}
            </dl>
          </section>
          {cardData.milestone_benefits && Object.keys(cardData.milestone_benefits).length > 0 && (
            <section className="border-t border-border pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Milestones</p>
              <div className="mt-5 divide-y divide-border border-y border-border">
                {Object.entries(cardData.milestone_benefits).map(([key, milestone]) => (
                  <div key={key} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-medium text-foreground">{milestone.benefit}</p><p className="mt-1 text-sm text-muted-foreground">Value: {formatCurrency(milestone.value, { showDecimals: false })}</p></div>
                    <p className="text-sm font-semibold text-foreground">At {formatCurrency(milestone.spend_threshold, { compact: true, showDecimals: false })} spend</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>

        <section aria-label="Benefits" className="space-y-10 border-t border-border pt-10">
          {cardData.welcome_benefits && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Welcome</p>
              {cardData.welcome_benefits.description && <p className="mt-3 max-w-2xl text-base leading-7 text-foreground/80">{cardData.welcome_benefits.description}</p>}
              <dl className="mt-6 divide-y divide-border border-y border-border">
                {cardData.welcome_benefits.vouchers?.map((voucher, index) => <div key={index} className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">{voucher.brand}</dt><dd className="font-semibold text-foreground">{formatCurrency(voucher.value, { showDecimals: false })}</dd></div>)}
                {cardData.welcome_benefits.points && cardData.welcome_benefits.points > 0 && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Welcome points</dt><dd className="font-semibold text-foreground">{cardData.welcome_benefits.points.toLocaleString()} points</dd></div>}
                {cardData.welcome_benefits.cashback && cardData.welcome_benefits.cashback > 0 && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Welcome cashback</dt><dd className="font-semibold text-foreground">{formatCurrency(cardData.welcome_benefits.cashback, { showDecimals: false })}</dd></div>}
              </dl>
            </section>
          )}

          <section className="border-t border-border pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Travel & protection</p>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Lounge access</dt><dd className="font-semibold capitalize text-foreground">{cardData.lounge_access.replace(/_/g, ' ')}</dd></div>
              {cardData.lounge_access_details && <div className="py-4 text-sm leading-6 text-muted-foreground">{cardData.lounge_access_details}</div>}
              {(cardData.lounge_visits_per_quarter ?? 0) > 0 && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Visits per quarter</dt><dd className="font-semibold text-foreground">{cardData.lounge_visits_per_quarter}</dd></div>}
              {cardData.travel_insurance_cover && cardData.travel_insurance_cover > 0 && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Travel insurance</dt><dd className="font-semibold text-foreground">{formatCurrency(cardData.travel_insurance_cover, { compact: true, showDecimals: false })}</dd></div>}
              {cardData.purchase_protection_cover && cardData.purchase_protection_cover > 0 && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Purchase protection</dt><dd className="font-semibold text-foreground">{formatCurrency(cardData.purchase_protection_cover, { compact: true, showDecimals: false })}</dd></div>}
            </dl>
          </section>

          {(cardData.fuel_surcharge_waiver || cardData.movie_benefits || cardData.dining_benefits || cardData.golf_access || cardData.concierge_service) && (
            <section className="border-t border-border pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">More benefits</p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-foreground/80">
                {cardData.fuel_surcharge_waiver && <li><span className="font-medium text-foreground">Fuel surcharge waiver.</span>{cardData.fuel_surcharge_waiver_cap ? ` Cap: ${formatCurrency(cardData.fuel_surcharge_waiver_cap, { showDecimals: false })}.` : ''}</li>}
                {cardData.movie_benefits && <li><span className="font-medium text-foreground">Movie benefits.</span> {cardData.movie_benefits}</li>}
                {cardData.dining_benefits && <li><span className="font-medium text-foreground">Dining benefits.</span> {cardData.dining_benefits}</li>}
                {cardData.golf_access && <li><span className="font-medium text-foreground">Golf access.</span> Included with this card.</li>}
                {cardData.concierge_service && <li><span className="font-medium text-foreground">Concierge service.</span> Included with this card.</li>}
              </ul>
            </section>
          )}
        </section>

        <section aria-label="Fees" className="border-t border-border pt-10">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Fees</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">What the card costs</h2>
            <dl className="mt-7 divide-y divide-border border-y border-border">
              <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Joining fee</dt><dd className="font-semibold text-foreground">{formatFee(cardData.joining_fee)}</dd></div>
              <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Annual fee</dt><dd className="font-semibold text-foreground">{formatFee(cardData.annual_fee)}</dd></div>
              <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Renewal fee</dt><dd className="font-semibold text-foreground">{formatFee(cardData.renewal_fee)}</dd></div>
              {cardData.annual_fee_waiver_spend && cardData.annual_fee_waiver_spend > 0 && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Fee waiver spend</dt><dd className="font-semibold text-foreground">{formatCurrency(cardData.annual_fee_waiver_spend, { showDecimals: false })}</dd></div>}
              {cardData.forex_markup && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Forex markup</dt><dd className="font-semibold text-foreground">{cardData.forex_markup}%</dd></div>}
            </dl>
          </section>
        </section>

        <section aria-label="Eligibility" className="border-t border-border pt-10">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Eligibility</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">Who can apply</h2>
            <dl className="mt-7 divide-y divide-border border-y border-border">
              {cardData.min_income_salaried && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Minimum salaried income</dt><dd className="font-semibold text-foreground">{formatCurrency(cardData.min_income_salaried, { compact: true, showDecimals: false })}</dd></div>}
              {cardData.min_income_self_employed && <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Minimum self-employed income</dt><dd className="font-semibold text-foreground">{formatCurrency(cardData.min_income_self_employed, { compact: true, showDecimals: false })}</dd></div>}
              <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Minimum CIBIL score</dt><dd className="font-semibold text-foreground">{cardData.min_cibil_score > 0 ? cardData.min_cibil_score : 'Not published'}</dd></div>
              <div className="flex justify-between gap-6 py-4 text-sm"><dt className="text-muted-foreground">Age requirement</dt><dd className="font-semibold text-foreground">{cardData.min_age}–{cardData.max_age} years</dd></div>
            </dl>
            <ul className="mt-7 space-y-4 text-sm text-foreground/80">
              <li className="flex items-center gap-3">{cardData.requires_itr ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />} ITR required</li>
              <li className="flex items-center gap-3">{cardData.requires_existing_relationship ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />} Existing banking relationship required</li>
              <li className="flex items-center gap-3">{cardData.emi_conversion_available ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />} EMI conversion available</li>
            </ul>
          </section>
        </section>
      </div>
    </div>
  )
}
