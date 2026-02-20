'use client'

import { useAdvisorStore, type CreditScoreRange, type EmploymentType } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'

const HIDE_SPINNERS = '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

const SCORE_RANGES: { value: CreditScoreRange; label: string; sublabel: string; color: string }[] = [
  { value: 'no_history', label: 'No history', sublabel: 'First-time applicant', color: 'bg-slate-400' },
  { value: 'below_600', label: 'Below 600', sublabel: 'Needs improvement', color: 'bg-red-500' },
  { value: '600_649', label: '600 -- 649', sublabel: 'Fair', color: 'bg-orange-500' },
  { value: '650_699', label: '650 -- 699', sublabel: 'Moderate', color: 'bg-amber-500' },
  { value: '700_749', label: '700 -- 749', sublabel: 'Good', color: 'bg-lime-500' },
  { value: '750_799', label: '750 -- 799', sublabel: 'Very Good', color: 'bg-emerald-500' },
  { value: '800_plus', label: '800+', sublabel: 'Excellent', color: 'bg-green-600' },
]

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' },
]

function formatIncome(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return String(value)
}

export function ProfileBasicsStep() {
  const store = useAdvisorStore()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          Your financial profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This helps us understand your eligibility and find cards that match your situation.
        </p>
      </div>

      {/* Credit Score */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          What is your current credit score range?
        </Label>
        <p className="text-xs text-muted-foreground -mt-1">
          If you are unsure, select your best estimate. You can check free on CIBIL, Experian, or your bank app.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SCORE_RANGES.map((range) => {
            const selected = store.creditScore === range.value
            return (
              <button
                key={range.value}
                type="button"
                onClick={() => store.updateField('creditScore', range.value)}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200',
                  selected
                    ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border hover:border-border/80 hover:bg-muted/40'
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', range.color)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{range.label}</p>
                  <p className="text-xs text-muted-foreground">{range.sublabel}</p>
                </div>
                {selected && (
                  <div className="absolute top-2 right-2.5">
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

      {/* Employment Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Employment type</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {EMPLOYMENT_OPTIONS.map((option) => {
            const selected = store.employmentType === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => store.updateField('employmentType', option.value)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200',
                  selected
                    ? 'border-primary/60 bg-primary/[0.06] text-foreground shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/40'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Monthly Income */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          {store.employmentType === 'student' ? 'Monthly income or allowance' : 'Monthly take-home income'}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">INR</span>
          <Input
            type="number"
            min={0}
            max={5000000}
            step={1000}
            value={store.monthlyIncome || ''}
            onChange={(e) => store.updateField('monthlyIncome', Number(e.target.value) || 0)}
            placeholder="e.g. 50000"
            className={cn('pl-12 rounded-xl h-11 text-sm tabular-nums', HIDE_SPINNERS)}
          />
        </div>
      </div>

      {/* Age */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Age</Label>
          <span className="text-sm font-semibold tabular-nums text-primary">{store.age} years</span>
        </div>
        <Slider
          value={[store.age]}
          onValueChange={([v]) => store.updateField('age', v)}
          min={18}
          max={70}
          step={1}
          className="w-full"
        />
      </div>

      {/* City & Primary Bank row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">City</Label>
          <Input
            value={store.city}
            onChange={(e) => store.updateField('city', e.target.value)}
            placeholder="e.g. Mumbai, Delhi, Bengaluru"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Primary bank</Label>
          <Input
            value={store.primaryBank}
            onChange={(e) => store.updateField('primaryBank', e.target.value)}
            placeholder="e.g. HDFC, SBI, ICICI"
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  )
}

export function canAdvanceFromBasics(state: { creditScore: CreditScoreRange; employmentType: EmploymentType; city: string; primaryBank: string }) {
  return Boolean(state.creditScore && state.employmentType && state.city && state.primaryBank)
}
