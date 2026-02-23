'use client'

import { useAdvisorStore } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'

const HIDE_SPINNERS = '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SPENDING_CATEGORIES = [
  { key: 'groceries', label: 'Groceries', sublabel: 'Supermarkets, BigBasket' },
  { key: 'fuel', label: 'Fuel', sublabel: 'Petrol, diesel, CNG' },
  { key: 'dining', label: 'Dining', sublabel: 'Restaurants, Swiggy, Zomato' },
  { key: 'travel', label: 'Travel', sublabel: 'Flights, hotels, Uber' },
  { key: 'online_shopping', label: 'Online Shopping', sublabel: 'Amazon, Flipkart' },
  { key: 'utilities', label: 'Utilities', sublabel: 'Bills, broadband, recharges' },
  { key: 'rent', label: 'Rent / EMI', sublabel: 'Housing, loan EMIs' },
  { key: 'entertainment', label: 'Entertainment', sublabel: 'OTT, movies, gaming' },
  { key: 'healthcare', label: 'Healthcare', sublabel: 'Pharmacy, doctor' },
  { key: 'education', label: 'Education', sublabel: 'Courses, books' },
] as const

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function SpendingProfileStep() {
  const store = useAdvisorStore()
  const selectedCount = store.topSpendingCategories.length
  const maxReached = selectedCount >= 5

  return (
    <div className="space-y-5">
      {/* Category selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Select your top spending categories</p>
          <span className={cn(
            'text-xs font-medium tabular-nums rounded-full px-2.5 py-0.5 border',
            selectedCount > 0
              ? 'text-[#b8860b] bg-[#fdf3d7] border-[#d4a017]/30'
              : 'text-muted-foreground bg-muted/40 border-border'
          )}>
            {selectedCount} / 5
          </span>
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Pick 1 to 5 categories. Fewer selections = more focused card match.
        </p>

        {/* 5-column compact grid on desktop, 2-col on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SPENDING_CATEGORIES.map((cat) => {
            const selected = store.topSpendingCategories.includes(cat.key)
            const disabled = !selected && maxReached
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => store.toggleSpendingCategory(cat.key)}
                disabled={disabled}
                className={cn(
                  'relative rounded-xl border p-3 text-left transition-all duration-200',
                  selected
                    ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                    : disabled
                      ? 'border-border/40 bg-muted/20 opacity-50 cursor-not-allowed'
                      : 'border-border bg-white hover:border-[#d4a017]/40 hover:bg-[#fdf3d7]/20'
                )}
              >
                {/* Checkbox indicator */}
                <div className={cn(
                  'mb-2 h-4 w-4 rounded border-2 flex items-center justify-center transition-colors',
                  selected ? 'border-[#b8860b] bg-gradient-to-br from-[#b8860b] to-[#d4a017]' : 'border-border/60'
                )}>
                  {selected && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight">{cat.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{cat.sublabel}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Amount inputs for selected categories */}
      {store.topSpendingCategories.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-foreground">Estimate monthly spend on each</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {store.topSpendingCategories.map((catKey) => {
              const cat = SPENDING_CATEGORIES.find((c) => c.key === catKey)
              if (!cat) return null
              const amount = store.spendingAmounts[catKey] ?? 5000
              return (
                <div
                  key={catKey}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-white px-4 py-3"
                >
                  <p className="text-sm font-medium text-foreground truncate">{cat.label}</p>
                  <div className="relative shrink-0 w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                      INR
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={amount || ''}
                      onChange={(e) => store.updateSpendingAmount(catKey, Number(e.target.value) || 0)}
                      placeholder="0"
                      className={cn(
                        'w-full rounded-lg border border-border bg-white pl-10 pr-3 py-1.5 text-sm tabular-nums text-foreground focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30',
                        HIDE_SPINNERS
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl border border-[#d4a017]/30 bg-[#fdf3d7]/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#b8860b]">
                <rect x="1" y="3" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1 6h12M4.5 6v6M9.5 6v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <p className="text-sm font-medium text-foreground">Total monthly card spend</p>
            </div>
            <p className="text-base font-bold tabular-nums text-[#b8860b]">
              INR {store.getTotalMonthlySpend().toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* International usage */}
      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-foreground">Do you use your card for international transactions?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            { value: true, label: 'Yes', desc: 'Foreign transaction fees and forex markup matter.' },
            { value: false, label: 'No, domestic only', desc: 'I do not shop on international sites or travel abroad.' },
          ] as const).map((opt) => {
            const selected = store.usesCardAbroad === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => store.updateField('usesCardAbroad', opt.value)}
                className={cn(
                  'relative rounded-xl border p-3.5 text-left transition-all duration-200',
                  selected
                    ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                    : 'border-border bg-white hover:border-[#d4a017]/40 hover:bg-[#fdf3d7]/20'
                )}
              >
                <p className="text-sm font-medium text-foreground pr-5">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                {selected && (
                  <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-gradient-to-br from-[#b8860b] to-[#d4a017] flex items-center justify-center shadow-sm">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

export function canAdvanceFromSpending(categories: string[]) {
  return categories.length >= 1
}
