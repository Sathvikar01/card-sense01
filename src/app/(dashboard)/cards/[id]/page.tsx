import { createPublicServerClient } from '@/lib/supabase/public-server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BackLink } from '@/components/shared/back-link'
import { Section } from '@/components/shared/section'
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

type SpecRow = [label: string, value: React.ReactNode]

function SpecGroup({ title, rows }: { title: string; rows: Array<SpecRow | false | null | undefined | 0 | ''> }) {
  const visible = rows.filter(Boolean) as SpecRow[]
  if (visible.length === 0) return null
  return (
    <Section title={title}>
      <dl>
        {visible.map(([label, value]) => (
          <div key={label} className="row justify-between py-2 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

function ListGroup({ title, items }: { title: string; items?: string[] | null }) {
  if (!items?.length) return null
  return (
    <Section title={title}>
      <ul>
        {items.map((item, i) => (
          <li key={i} className="row py-2 text-sm leading-relaxed">{item}</li>
        ))}
      </ul>
    </Section>
  )
}

function CardDetailContent({ cardData: c }: { cardData: CreditCard }) {
  const fee = (value: number) => (value === 0 ? 'Free' : formatCurrency(value, { showDecimals: false }))
  const inr = (value: number) => formatCurrency(value, { showDecimals: false })
  const lakh = (value: number) => formatCurrency(value, { compact: true, showDecimals: false })
  const yesNo = (value: boolean | null) => (value ? 'Yes' : 'No')
  const rewardUnit = (unit: string) =>
    unit === 'points_per_100' ? ' pts / ₹100' : unit === 'percent_cashback' ? '% cashback' : '% waiver'

  const keyStats = [
    ['Annual fee', fee(c.annual_fee)],
    ['Rewards', c.reward_rate_default > 0 ? `${c.reward_rate_default}%` : '—'],
    ['Min. income', c.min_income_salaried ? lakh(c.min_income_salaried) : '—'],
  ]

  const benefits = [
    c.fuel_surcharge_waiver && 'Fuel surcharge waiver',
    c.movie_benefits,
    c.dining_benefits,
    c.golf_access && 'Golf access',
    c.concierge_service && 'Concierge',
  ].filter(Boolean) as string[]

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/cards">All cards</BackLink>

      <header className="grid gap-8 sm:grid-cols-[minmax(0,320px)_1fr] sm:items-center">
        <CreditCardVisual
          cardId={c.id}
          cardSlug={c.card_slug}
          size="md"
          cardName={c.card_name}
          bankName={c.bank_name}
          network={c.card_network}
          imageUrl={c.image_url}
          interactive
          className="w-full"
        />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{c.card_name}</h1>
          <p className="mt-1 text-muted-foreground">{c.bank_name}</p>
          <dl className="mt-6 flex gap-8">
            {keyStats.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          {c.apply_url && (
            <Button asChild className="mt-6">
              <a href={c.apply_url} target="_blank" rel="noopener noreferrer">
                Apply on bank site
              </a>
            </Button>
          )}
        </div>
      </header>

      {c.description && <p className="mt-10 text-[15px] leading-relaxed text-foreground/80">{c.description}</p>}

      <div className="mt-10 space-y-10">
        <ListGroup title="Good" items={[...(c.pros || []), ...benefits]} />
        <ListGroup title="Watch out" items={c.cons} />
        <SpecGroup
          title="Details"
          rows={[
            ['Joining fee', fee(c.joining_fee)],
            ['Annual fee', fee(c.annual_fee)],
            ['Renewal fee', fee(c.renewal_fee)],
            Boolean(c.annual_fee_waiver_spend) && ['Fee waived at', `${inr(c.annual_fee_waiver_spend!)} spend`],
            Boolean(c.forex_markup) && ['Forex markup', `${c.forex_markup}%`],
            ['Base rewards', c.reward_rate_default > 0 ? `${c.reward_rate_default}%` : '—'],
            ...Object.entries(c.reward_rate_categories || {}).map(
              ([category, reward]): SpecRow => [category.replace(/_/g, ' '), `${reward.rate}${rewardUnit(reward.unit)}`]
            ),
            ...Object.entries(c.milestone_benefits || {}).map(
              ([key, m]): SpecRow => [`At ${lakh(m.spend_threshold)} spend`, m.benefit || inr(m.value) || key]
            ),
            ...(c.welcome_benefits?.vouchers || []).map((v): SpecRow => [`Welcome: ${v.brand}`, inr(v.value)]),
            Boolean(c.welcome_benefits?.points) && ['Welcome points', c.welcome_benefits!.points!.toLocaleString('en-IN')],
            Boolean(c.welcome_benefits?.cashback) && ['Welcome cashback', inr(c.welcome_benefits!.cashback!)],
            c.lounge_access !== 'none' && ['Lounge', c.lounge_access.replace(/_/g, ' ')],
            Boolean(c.lounge_visits_per_quarter) && ['Lounge visits a quarter', c.lounge_visits_per_quarter],
            Boolean(c.travel_insurance_cover) && ['Travel insurance', lakh(c.travel_insurance_cover!)],
            Boolean(c.purchase_protection_cover) && ['Purchase protection', lakh(c.purchase_protection_cover!)],
            Boolean(c.min_income_salaried) && ['Income, salaried', lakh(c.min_income_salaried!)],
            Boolean(c.min_income_self_employed) && ['Income, self-employed', lakh(c.min_income_self_employed!)],
            c.min_cibil_score > 0 && ['CIBIL score', c.min_cibil_score],
            ['Age', `${c.min_age}–${c.max_age}`],
            ['ITR required', yesNo(c.requires_itr)],
            ['Bank relationship required', yesNo(c.requires_existing_relationship)],
            ['EMI conversion', yesNo(c.emi_conversion_available)],
          ]}
        />
      </div>
    </div>
  )
}
