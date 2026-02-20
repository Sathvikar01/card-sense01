'use client'

import { useAdvisorStore } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const HIDE_SPINNERS = '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

const SPENDING_CATEGORIES = [
  { key: 'groceries', label: 'Groceries', sublabel: 'Supermarkets, kirana, BigBasket' },
  { key: 'fuel', label: 'Fuel', sublabel: 'Petrol, diesel, CNG' },
  { key: 'dining', label: 'Dining', sublabel: 'Restaurants, Zomato, Swiggy' },
  { key: 'travel', label: 'Travel', sublabel: 'Flights, hotels, trains, Ola/Uber' },
  { key: 'online_shopping', label: 'Online Shopping', sublabel: 'Amazon, Flipkart, Myntra' },
  { key: 'utilities', label: 'Utilities and Bills', sublabel: 'Electricity, broadband, recharges' },
  { key: 'rent', label: 'Rent or EMI', sublabel: 'Housing rent, loan EMIs' },
  { key: 'entertainment', label: 'Entertainment', sublabel: 'OTT, movies, gaming, events' },
  { key: 'healthcare', label: 'Healthcare', sublabel: 'Pharmacy, doctor visits, insurance' },
  { key: 'education', label: 'Education', sublabel: 'Courses, books, subscriptions' },
] as const

export function SpendingProfileStep() {
  const store = useAdvisorStore()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          Where does your money go?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your top 3 to 5 spending categories and estimate monthly amounts. This directly determines which reward structures give you the highest return.
        </p>
      </div>

      {/* Category selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">
            Select your top spending categories
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {store.topSpendingCategories.length} of 5 selected
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SPENDING_CATEGORIES.map((cat) => {
            const selected = store.topSpendingCategories.includes(cat.key)
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => store.toggleSpendingCategory(cat.key)}
                className={cn(
                  'relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200',
                  selected
                    ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border hover:border-border/80 hover:bg-muted/40',
                  !selected && store.topSpendingCategories.length >= 5 && 'opacity-50 cursor-not-allowed'
                )}
                disabled={!selected && store.topSpendingCategories.length >= 5}
              >
                <div className={cn(
                  'mt-0.5 h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors',
                  selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                )}>
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.sublabel}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Spending amounts per selected category */}
      {store.topSpendingCategories.length > 0 && (
        <div className="space-y-5">
          <Label className="text-sm font-medium text-foreground">
            Estimate monthly spend on each
          </Label>
          <div className="space-y-3">
            {store.topSpendingCategories.map((catKey) => {
              const cat = SPENDING_CATEGORIES.find((c) => c.key === catKey)
              if (!cat) return null
              const amount = store.spendingAmounts[catKey] ?? 5000
              return (
                <div key={catKey} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-4 bg-muted/20">
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <div className="relative w-36 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">INR</span>
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      value={amount || ''}
                      onChange={(e) => store.updateSpendingAmount(catKey, Number(e.target.value) || 0)}
                      placeholder="0"
                      className={cn('pl-10 h-9 rounded-lg text-sm tabular-nums', HIDE_SPINNERS)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total spend summary */}
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
            <p className="text-sm font-medium text-foreground">Total estimated monthly card spend</p>
            <p className="text-lg font-bold tabular-nums text-primary">
              INR {store.getTotalMonthlySpend().toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Foreign usage */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Do you use your card for international transactions?
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { value: true, label: 'Yes, regularly or occasionally', desc: 'Foreign transaction fees and forex markup matter to me.' },
            { value: false, label: 'No, domestic use only', desc: 'I do not shop on international sites or travel abroad frequently.' },
          ].map((opt) => {
            const selected = store.usesCardAbroad === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => store.updateField('usesCardAbroad', opt.value)}
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

      {/* Desired credit limit */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Minimum credit limit you need
        </Label>
        <p className="text-xs text-muted-foreground -mt-1">
          A good target is 2x-3x your monthly card spend to keep utilization under 30-40%.
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">INR</span>
          <Input
            type="number"
            min={10000}
            max={10000000}
            step={10000}
            value={store.desiredCreditLimit || ''}
            onChange={(e) => store.updateField('desiredCreditLimit', Number(e.target.value) || 10000)}
            placeholder="e.g. 100000"
            className={cn('pl-12 rounded-xl h-11 text-sm tabular-nums', HIDE_SPINNERS)}
          />
        </div>
      </div>
    </div>
  )
}

export function canAdvanceFromSpending(categories: string[]) {
  return categories.length >= 1
}
