'use client'

import { useAdvisorStore, type PrimaryGoal, type CardComplexity } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

const GOAL_OPTIONS: { value: PrimaryGoal; label: string; description: string }[] = [
  { value: 'rewards_cashback', label: 'Rewards and cashback', description: 'Earn back a percentage of every purchase as points or cash.' },
  { value: 'low_interest', label: 'Low interest rates', description: 'Keep finance charges minimal when I occasionally carry a balance.' },
  { value: 'credit_building', label: 'Build or repair credit', description: 'Establish a positive credit history or recover from past issues.' },
  { value: 'travel_perks', label: 'Travel benefits', description: 'Airport lounges, free checked bags, travel insurance, waived forex.' },
  { value: 'fuel_savings', label: 'Fuel savings', description: 'Surcharge waivers and accelerated rewards at fuel stations.' },
  { value: 'online_shopping', label: 'Online shopping rewards', description: 'Extra points or instant discounts on ecommerce and app purchases.' },
  { value: 'premium_lifestyle', label: 'Premium lifestyle perks', description: 'Concierge, golf, dining privileges, and super-premium benefits.' },
  { value: 'debt_management', label: 'Debt management', description: 'Balance transfers, low EMI conversion, and manageable terms.' },
]

const SECONDARY_GOALS = [
  'Cashback on everyday spending',
  'Airport lounge access',
  'Fuel surcharge waiver',
  'Low or zero annual fee',
  'Purchase protection and insurance',
  'Milestone or welcome bonuses',
  'EMI conversion at low rates',
  'Free credit score tracking',
  'Dining and entertainment offers',
  'No foreign transaction fees',
]

const COMPLEXITY_OPTIONS: { value: CardComplexity; label: string; description: string }[] = [
  { value: 'one_simple', label: 'One simple card', description: 'A single card that does everything reasonably well. Minimal management.' },
  { value: 'few_optimized', label: 'Two or three specialized cards', description: 'A small set where each card covers different categories for better returns.' },
  { value: 'dont_mind_complex', label: 'Optimize fully', description: 'I am willing to manage multiple cards, track bonus categories, and rotate spending.' },
]

export function GoalsStep() {
  const store = useAdvisorStore()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          What matters most to you?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your primary goal shapes which card features we prioritize. Secondary goals help us break ties between similar cards.
        </p>
      </div>

      {/* Primary Goal */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Primary goal</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((goal) => {
            const selected = store.primaryGoal === goal.value
            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => store.updateField('primaryGoal', goal.value)}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all duration-200',
                  selected
                    ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border hover:border-border/80 hover:bg-muted/40'
                )}
              >
                <p className="text-sm font-medium text-foreground leading-snug">{goal.label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{goal.description}</p>
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

      {/* Secondary Goals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-foreground">Secondary benefits you value</Label>
          <span className="text-xs text-muted-foreground">Select any that apply</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SECONDARY_GOALS.map((goal) => {
            const selected = store.secondaryGoals.includes(goal)
            return (
              <button
                key={goal}
                type="button"
                onClick={() => store.toggleSecondaryGoal(goal)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                  selected
                    ? 'border-primary/50 bg-primary/[0.08] text-primary'
                    : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/40'
                )}
              >
                {goal}
              </button>
            )
          })}
        </div>
      </div>

      {/* Complexity Preference */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          How many cards are you willing to manage?
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {COMPLEXITY_OPTIONS.map((opt) => {
            const selected = store.cardComplexity === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => store.updateField('cardComplexity', opt.value)}
                className={cn(
                  'relative rounded-xl border p-4 text-left transition-all duration-200',
                  selected
                    ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                    : 'border-border hover:border-border/80 hover:bg-muted/40'
                )}
              >
                <p className="text-sm font-medium text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
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
