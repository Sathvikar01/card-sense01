'use client'

import { useAdvisorStore, type PaymentBehavior, type AprTolerance, type AnnualFeeTolerance, type DisciplineLevel } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface OptionCard {
  value: string
  label: string
  description: string
}

function OptionGrid<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string
  hint?: string
  options: { value: T; label: string; description: string }[]
  value: T
  onChange: (v: T) => void
  columns?: 2 | 3 | 4
}) {
  const gridClass =
    columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className={cn('grid gap-2', gridClass)}>
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'relative rounded-xl border p-4 text-left transition-all duration-200',
                selected
                  ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                  : 'border-border hover:border-border/80 hover:bg-muted/40'
              )}
            >
              <p className="text-sm font-medium text-foreground leading-snug">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
              {selected && (
                <div className="absolute top-2.5 right-2.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" className="fill-primary" />
                    <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const PAYMENT_OPTIONS: OptionCard[] = [
  { value: 'full_always', label: 'Full balance every month', description: 'I never carry forward any balance to the next billing cycle.' },
  { value: 'full_mostly', label: 'Full most months', description: 'Occasionally I pay less than full, but I clear it quickly.' },
  { value: 'minimum_often', label: 'Minimum or partial often', description: 'I regularly pay only the minimum due or a partial amount.' },
  { value: 'carry_balance', label: 'I carry balances regularly', description: 'I often revolve credit and pay interest on outstanding amounts.' },
]

const APR_OPTIONS: OptionCard[] = [
  { value: 'below_18', label: 'Below 18% p.a.', description: 'I only want cards with relatively low finance charges.' },
  { value: '18_to_24', label: '18% -- 24% p.a.', description: 'Standard range is acceptable for occasional revolving.' },
  { value: '24_to_36', label: '24% -- 36% p.a.', description: 'Higher interest is fine if the card has strong benefits.' },
  { value: 'doesnt_matter', label: 'Does not matter', description: 'I plan to pay in full so interest rate is irrelevant.' },
]

const FEE_OPTIONS: OptionCard[] = [
  { value: 'zero', label: 'Zero annual fee only', description: 'I am not willing to pay any recurring fee.' },
  { value: 'under_500', label: 'Up to INR 500', description: 'A small fee is acceptable for meaningful returns.' },
  { value: 'under_2000', label: 'Up to INR 2,000', description: 'I will pay a moderate fee if benefits clearly exceed the cost.' },
  { value: 'under_5000', label: 'Up to INR 5,000', description: 'Ready to invest in a premium card with strong returns.' },
  { value: 'any_if_worth', label: 'Any amount, if worth it', description: 'Fee does not matter as long as net value is positive.' },
]

const DISCIPLINE_OPTIONS: OptionCard[] = [
  { value: 'very_disciplined', label: 'Very disciplined', description: 'I always pay on time. Autopay is set up and I track due dates.' },
  { value: 'mostly_on_time', label: 'Mostly on time', description: 'Rarely miss a date but it happens once or twice a year.' },
  { value: 'sometimes_late', label: 'Sometimes late', description: 'I occasionally miss deadlines by a few days.' },
  { value: 'need_help', label: 'I need help staying on track', description: 'Strong reminders, autopay, and low penalty cards matter to me.' },
]

export function FinancialHabitsStep() {
  const store = useAdvisorStore()

  const showAprQuestion =
    store.paymentBehavior === 'minimum_often' || store.paymentBehavior === 'carry_balance'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          Your financial habits
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Understanding how you use credit helps us recommend cards that suit your actual behavior, not just your aspirations.
        </p>
      </div>

      <OptionGrid<PaymentBehavior>
        label="How do you typically handle your credit card bill?"
        options={PAYMENT_OPTIONS as { value: PaymentBehavior; label: string; description: string }[]}
        value={store.paymentBehavior}
        onChange={(v) => store.updateField('paymentBehavior', v)}
      />

      {showAprQuestion && (
        <OptionGrid<AprTolerance>
          label="What interest rate range are you comfortable with?"
          hint="Since you sometimes carry a balance, the finance charge rate matters."
          options={APR_OPTIONS as { value: AprTolerance; label: string; description: string }[]}
          value={store.aprTolerance}
          onChange={(v) => store.updateField('aprTolerance', v)}
        />
      )}

      <OptionGrid<AnnualFeeTolerance>
        label="How much are you willing to pay as an annual fee?"
        hint="Higher-fee cards often return 2x-5x their fee in rewards and perks if used well."
        options={FEE_OPTIONS as { value: AnnualFeeTolerance; label: string; description: string }[]}
        value={store.annualFeeTolerance}
        onChange={(v) => store.updateField('annualFeeTolerance', v)}
        columns={3}
      />

      <OptionGrid<DisciplineLevel>
        label="How disciplined are you about payment due dates?"
        options={DISCIPLINE_OPTIONS as { value: DisciplineLevel; label: string; description: string }[]}
        value={store.disciplineLevel}
        onChange={(v) => store.updateField('disciplineLevel', v)}
      />

      {/* Intro offers */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Are you comfortable with introductory offers that require meeting a minimum spend within a deadline?
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { value: true, label: 'Yes, I can plan for it', desc: 'I can channel enough spending to meet a welcome bonus threshold.' },
            { value: false, label: 'No, prefer straightforward', desc: 'I would rather skip conditional offers and get steady rewards.' },
          ].map((opt) => {
            const selected = store.interestedInIntroOffers === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => store.updateField('interestedInIntroOffers', opt.value)}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all duration-200',
                  selected
                    ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border hover:border-border/80 hover:bg-muted/40'
                )}
              >
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                {selected && (
                  <div className="absolute top-2.5 right-2.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="8" className="fill-primary" />
                      <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
