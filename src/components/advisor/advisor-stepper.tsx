'use client'

import { useAdvisorStore } from '@/lib/store/advisor-store'
import { canAdvanceFromBasics, ProfileBasicsStep } from './step-profile-basics'
import { FinancialHabitsStep } from './step-financial-habits'
import { SpendingProfileStep, canAdvanceFromSpending } from './step-spending-profile'
import { GoalsStep } from './step-goals'
import { PersonaStep } from './step-persona'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'basics', label: 'Profile' },
  { key: 'habits', label: 'Habits' },
  { key: 'spending', label: 'Spending' },
  { key: 'goals', label: 'Goals' },
  { key: 'persona', label: 'Details' },
] as const

interface Props {
  onComplete: () => void
  isLoading: boolean
}

export function AdvisorStepper({ onComplete, isLoading }: Props) {
  const store = useAdvisorStore()
  const current = store.currentStep
  const total = STEPS.length

  const canAdvance = (): boolean => {
    switch (current) {
      case 0:
        return canAdvanceFromBasics({
          creditScore: store.creditScore,
          employmentType: store.employmentType,
          city: store.city,
          primaryBank: store.primaryBank,
        })
      case 1:
        return true // habits always valid
      case 2:
        return canAdvanceFromSpending(store.topSpendingCategories)
      case 3:
        return Boolean(store.primaryGoal)
      case 4:
        return true // persona-specific always valid
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!canAdvance()) return

    store.markStepComplete(current)

    if (current === 3) {
      // Before persona step, detect persona
      store.runPersonaDetection()
    }

    if (current < total - 1) {
      store.setStep(current + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (current > 0) {
      store.setStep(current - 1)
    }
  }

  const progress = ((current + 1) / total) * 100

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {current + 1} of {total}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4a017] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators - desktop */}
        <div className="hidden sm:flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const completed = store.completedSteps.includes(idx)
            const active = idx === current

            return (
              <button
                key={step.key}
                type="button"
                onClick={() => {
                  if (completed || idx <= current) store.setStep(idx)
                }}
                className={cn(
                  'flex items-center gap-2 text-xs font-medium transition-colors',
                  active
                    ? 'text-[#b8860b]'
                    : completed
                      ? 'text-foreground/70 cursor-pointer hover:text-foreground'
                      : 'text-muted-foreground/50 cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold border transition-colors',
                    active
                      ? 'border-[#b8860b] bg-gradient-to-br from-[#b8860b] to-[#d4a017] text-white'
                      : completed
                        ? 'border-[#d4a017]/40 bg-[#fdf3d7] text-[#b8860b]'
                        : 'border-border bg-muted/40 text-muted-foreground'
                  )}
                >
                  {completed ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6L5 8L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="hidden md:inline">{step.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {current === 0 && <ProfileBasicsStep />}
        {current === 1 && <FinancialHabitsStep />}
        {current === 2 && <SpendingProfileStep />}
        {current === 3 && <GoalsStep />}
        {current === 4 && <PersonaStep />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={current === 0}
          className="gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canAdvance() || isLoading}
          className="gap-2 min-w-[160px] bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-lg shadow-[#b8860b]/20 hover:shadow-[#b8860b]/35"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Analyzing...
            </span>
          ) : current === total - 1 ? (
            <>
              Get Recommendations
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          ) : (
            <>
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
