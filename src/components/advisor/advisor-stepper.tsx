'use client'

import { useAdvisorStore } from '@/lib/store/advisor-store'
import { ProfileBasicsStep, canAdvanceFromBasics } from './step-profile-basics'
import { FinancialHabitsStep } from './step-financial-habits'
import { SpendingProfileStep, canAdvanceFromSpending } from './step-spending-profile'
import { GoalsStep } from './step-goals'
import { cn } from '@/lib/utils'

const STEPS = [
  { index: 0, label: 'Profile', sublabel: 'Eligibility basics' },
  { index: 1, label: 'Habits', sublabel: 'Payment & fees' },
  { index: 2, label: 'Spending', sublabel: 'Categories' },
  { index: 3, label: 'Goals', sublabel: 'What you want' },
] as const

interface Props {
  onComplete: () => void
  isLoading: boolean
}

export function AdvisorStepper({ onComplete, isLoading }: Props) {
  const store = useAdvisorStore()
  const current = store.currentStep

  const canAdvance = (): boolean => {
    switch (current) {
      case 0:
        return canAdvanceFromBasics({
          creditScore: store.creditScore,
          employmentType: store.employmentType,
          monthlyIncome: store.monthlyIncome,
          city: store.city,
          primaryBank: store.primaryBank,
          prefilledFields: store.profilePrefilledFields,
        })
      case 1:
        return true
      case 2:
        return canAdvanceFromSpending(store.topSpendingCategories)
      case 3:
        return Boolean(store.primaryGoal)
      default: return false
    }
  }

  const handleNext = () => {
    if (!canAdvance()) return
    store.markStepComplete(current)
    if (current === 3) {
      onComplete()
    } else {
      if (current === 2) {
        // Run persona detection before goals step
        store.runPersonaDetection()
      }
      store.setStep(current + 1)
    }
  }

  const handleBack = () => {
    if (current > 0) store.setStep(current - 1)
  }

  return (
    <div className="flex flex-col">
      {/* Step navigation header */}
      <div className="px-6 pt-6 pb-5 border-b border-border/50">
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const completed = store.completedSteps.includes(step.index)
            const active = step.index === current
            const accessible = completed || step.index <= current

            return (
              <div key={step.index} className="flex items-center flex-1 last:flex-none">
                {/* Step button */}
                <button
                  type="button"
                  onClick={() => { if (accessible) store.setStep(step.index) }}
                  disabled={!accessible}
                  className={cn(
                    'flex flex-col items-start gap-1.5 text-left group',
                    !accessible && 'cursor-default'
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-semibold tabular-nums leading-none',
                      active ? 'text-[#b8860b]' : completed ? 'text-foreground/70' : 'text-muted-foreground/50'
                    )}
                  >
                    {step.index + 1}
                  </span>
                  <div>
                    <p className={cn(
                      'text-xs font-semibold leading-tight transition-colors',
                      active ? 'text-[#b8860b]' : completed ? 'text-foreground/70' : 'text-muted-foreground/50'
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      'text-[10px] leading-tight hidden sm:block transition-colors',
                      active ? 'text-[#b8860b]/70' : 'text-muted-foreground/40'
                    )}>
                      {step.sublabel}
                    </p>
                    <span
                      className={cn(
                        'mt-1 block h-[1.5px] w-16 transition-colors duration-200',
                        active ? 'bg-[#d4a017]' : completed ? 'bg-[#d4a017]/45' : 'bg-border/60'
                      )}
                    />
                  </div>
                </button>

                {/* Connector line (not after last) */}
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 mx-3 mb-6">
                    <div className={cn(
                      'h-[1.5px] w-full transition-colors duration-300',
                      store.completedSteps.includes(step.index) ? 'bg-[#d4a017]/60' : 'bg-border/60'
                    )} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 py-6">
        {current === 0 && <ProfileBasicsStep />}
        {current === 1 && <FinancialHabitsStep />}
        {current === 2 && <SpendingProfileStep />}
        {current === 3 && <GoalsStep />}
      </div>

      {/* Navigation footer */}
      <div className="px-6 pb-6 pt-4 border-t border-border/50 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={current === 0}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
            current === 0
              ? 'text-muted-foreground/30 cursor-default'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance() || isLoading}
          className={cn(
            'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 min-w-[160px] justify-center',
            canAdvance() && !isLoading
              ? 'bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-md shadow-[#b8860b]/25 hover:shadow-[#b8860b]/40'
              : 'bg-muted text-muted-foreground cursor-default'
          )}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20"/>
                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Analyzing...
            </>
          ) : current === 3 ? (
            <>
              Get Recommendations
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          ) : (
            <>
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
