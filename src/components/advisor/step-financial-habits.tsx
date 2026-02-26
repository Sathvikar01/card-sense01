'use client'

import { useAdvisorStore, type PaymentBehavior, type AprTolerance, type AnnualFeeTolerance, type DisciplineLevel } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Golden check mark                                                  */
/* ------------------------------------------------------------------ */

function GoldenCheck() {
  return (
    <div className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center text-[#b8860b] shrink-0">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Generic tile grid                                                   */
/* ------------------------------------------------------------------ */

function TileGrid<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  cols = 2,
}: {
  label: string
  hint?: string
  options: { value: T; label: string; description: string }[]
  value: T
  onChange: (v: T) => void
  cols?: 2 | 3 | 4
}) {
  const gridClass =
    cols === 4 ? 'grid-cols-2 lg:grid-cols-4'
    : cols === 3 ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
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
                'relative rounded-xl border p-3.5 text-left transition-all duration-200',
                selected
                  ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                  : 'border-border bg-white hover:border-[#d4a017]/40 hover:bg-[#fdf3d7]/20'
              )}
            >
              <p className="text-sm font-medium text-foreground leading-snug pr-5">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.description}</p>
              {selected && <GoldenCheck />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Option data                                                        */
/* ------------------------------------------------------------------ */

const PAYMENT_OPTIONS: { value: PaymentBehavior; label: string; description: string }[] = [
  { value: 'full_always', label: 'Full balance every month', description: 'I never carry forward any balance.' },
  { value: 'full_mostly', label: 'Full most months', description: 'Occasionally carry a small balance, clear quickly.' },
  { value: 'minimum_often', label: 'Minimum or partial often', description: 'I regularly pay only the minimum due.' },
  { value: 'carry_balance', label: 'Carry balances regularly', description: 'I often revolve credit and pay interest.' },
]

const APR_OPTIONS: { value: AprTolerance; label: string; description: string }[] = [
  { value: 'below_18', label: 'Below 18% p.a.', description: 'Low finance charges only.' },
  { value: '18_to_24', label: '18% to 24% p.a.', description: 'Standard range for occasional revolving.' },
  { value: '24_to_36', label: '24% to 36% p.a.', description: 'Fine if the card has strong benefits.' },
  { value: 'doesnt_matter', label: 'Does not matter', description: 'I pay in full so APR is irrelevant.' },
]

const FEE_OPTIONS: { value: AnnualFeeTolerance; label: string; description: string }[] = [
  { value: 'zero', label: 'Zero annual fee', description: 'Not willing to pay any recurring fee.' },
  { value: 'under_500', label: 'Up to INR 500', description: 'Small fee for meaningful returns.' },
  { value: 'under_2000', label: 'Up to INR 2,000', description: 'Moderate fee if benefits exceed cost.' },
  { value: 'under_5000', label: 'Up to INR 5,000', description: 'Ready for a premium card.' },
  { value: 'any_if_worth', label: 'Any, if worth it', description: 'Fee does not matter if net value is positive.' },
]

const DISCIPLINE_OPTIONS: { value: DisciplineLevel; label: string; description: string }[] = [
  { value: 'very_disciplined', label: 'Very disciplined', description: 'Always on time. Autopay is set.' },
  { value: 'mostly_on_time', label: 'Mostly on time', description: 'Rarely miss a date.' },
  { value: 'sometimes_late', label: 'Sometimes late', description: 'Miss deadlines by a few days occasionally.' },
  { value: 'need_help', label: 'Need help', description: 'Strong reminders and low-penalty cards matter.' },
]

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function FinancialHabitsStep() {
  const store = useAdvisorStore()

  const showAprQuestion =
    store.paymentBehavior === 'minimum_often' || store.paymentBehavior === 'carry_balance'

  const missingCity = !store.city
  const missingBank = !store.primaryBank

  return (
    <div className="space-y-6">

      {/* Quick Setup — only shown when profile fields are missing */}
      {(missingCity || missingBank) && (
        <div className="rounded-xl border border-[#d4a017]/30 bg-[#fdf3d7]/40 p-4 space-y-4">
          <div className="flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-[#b8860b]">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v4M8 11v0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-xs font-semibold text-[#b8860b]">A couple of details from your profile are missing</p>
              <p className="text-[11px] text-[#b8860b]/70 mt-0.5">Fill them here and they will be saved to your profile.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {missingCity && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">City</p>
                <input
                  type="text"
                  value={store.city}
                  onChange={(e) => store.updateField('city', e.target.value)}
                  placeholder="e.g. Mumbai, Delhi"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30"
                />
              </div>
            )}
            {missingBank && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Primary Bank</p>
                <input
                  type="text"
                  value={store.primaryBank}
                  onChange={(e) => store.updateField('primaryBank', e.target.value)}
                  placeholder="e.g. HDFC, SBI, ICICI"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment behavior */}
      <TileGrid<PaymentBehavior>
        label="How do you typically handle your credit card bill?"
        options={PAYMENT_OPTIONS}
        value={store.paymentBehavior}
        onChange={(v) => store.updateField('paymentBehavior', v)}
      />

      {/* APR — conditional on carrying balance */}
      {showAprQuestion && (
        <TileGrid<AprTolerance>
          label="What interest rate range are you comfortable with?"
          hint="Since you carry a balance, the finance charge rate matters."
          options={APR_OPTIONS}
          value={store.aprTolerance}
          onChange={(v) => store.updateField('aprTolerance', v)}
        />
      )}

      {/* Annual fee */}
      <TileGrid<AnnualFeeTolerance>
        label="How much are you willing to pay as an annual fee?"
        hint="Higher-fee cards often return 2x to 5x their fee in rewards if used well."
        options={FEE_OPTIONS}
        value={store.annualFeeTolerance}
        onChange={(v) => store.updateField('annualFeeTolerance', v)}
        cols={3}
      />

      {/* Discipline */}
      <TileGrid<DisciplineLevel>
        label="How disciplined are you about payment due dates?"
        options={DISCIPLINE_OPTIONS}
        value={store.disciplineLevel}
        onChange={(v) => store.updateField('disciplineLevel', v)}
      />

      {/* Intro offers toggle */}
      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-foreground">
          Can you meet a minimum spend threshold within 60 to 90 days for a welcome bonus?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            { value: true, label: 'Yes, I can plan for it', desc: 'I can channel enough spending to unlock a welcome bonus.' },
            { value: false, label: 'Prefer straightforward', desc: 'I would rather get steady rewards without conditions.' },
          ] as const).map((opt) => {
            const selected = store.interestedInIntroOffers === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => store.updateField('interestedInIntroOffers', opt.value)}
                className={cn(
                  'relative rounded-xl border p-3.5 text-left transition-all duration-200',
                  selected
                    ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                    : 'border-border bg-white hover:border-[#d4a017]/40 hover:bg-[#fdf3d7]/20'
                )}
              >
                <p className="text-sm font-medium text-foreground pr-5">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                {selected && <GoldenCheck />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
