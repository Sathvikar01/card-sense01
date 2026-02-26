'use client'

import { useAdvisorStore, type PrimaryGoal, type CardComplexity, type UserPersona } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'

const HIDE_SPINNERS = '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

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
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const GOAL_OPTIONS: { value: PrimaryGoal; label: string; description: string }[] = [
  { value: 'rewards_cashback', label: 'Rewards and cashback', description: 'Earn back a percentage of every purchase.' },
  { value: 'low_interest', label: 'Low interest rates', description: 'Keep finance charges minimal when carrying a balance.' },
  { value: 'credit_building', label: 'Build or repair credit', description: 'Establish or recover credit history.' },
  { value: 'travel_perks', label: 'Travel benefits', description: 'Lounges, free bags, travel insurance, waived forex.' },
  { value: 'fuel_savings', label: 'Fuel savings', description: 'Surcharge waivers and rewards at fuel stations.' },
  { value: 'online_shopping', label: 'Online shopping rewards', description: 'Extra points on ecommerce and apps.' },
  { value: 'premium_lifestyle', label: 'Premium lifestyle', description: 'Concierge, golf, dining, and super-premium perks.' },
  { value: 'debt_management', label: 'Debt management', description: 'Balance transfers, low EMI conversion.' },
]

const SECONDARY_GOALS = [
  'Cashback on everyday spending',
  'Airport lounge access',
  'Fuel surcharge waiver',
  'Low or zero annual fee',
  'Purchase protection',
  'Milestone bonuses',
  'EMI at low rates',
  'Free credit score tracking',
  'Dining offers',
  'No foreign transaction fees',
]

const COMPLEXITY_OPTIONS: { value: CardComplexity; label: string; description: string }[] = [
  { value: 'one_simple', label: 'One simple card', description: 'Single card that does everything reasonably well.' },
  { value: 'few_optimized', label: '2 to 3 specialized cards', description: 'Each card covers different categories for better returns.' },
  { value: 'dont_mind_complex', label: 'Optimize fully', description: 'I am willing to manage multiple cards and rotate spending.' },
]

/* ------------------------------------------------------------------ */
/*  Persona section label map                                          */
/* ------------------------------------------------------------------ */

const PERSONA_LABELS: Record<UserPersona, string> = {
  student_firsttime: 'Student / First-timer',
  salaried_everyday: 'Salaried Professional',
  rewards_maximizer: 'Rewards Maximizer',
  frequent_traveller: 'Frequent Traveller',
  online_shopper: 'Online Shopper',
  self_employed: 'Self-Employed / Business',
  credit_builder: 'Credit Builder',
}

/* ------------------------------------------------------------------ */
/*  Persona-specific follow-up sections                               */
/* ------------------------------------------------------------------ */

function BooleanPair({
  label,
  value,
  onChange,
  yesLabel = 'Yes',
  noLabel = 'No',
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  yesLabel?: string
  noLabel?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {([
          { val: true, lbl: yesLabel },
          { val: false, lbl: noLabel },
        ] as const).map((opt) => {
          const selected = value === opt.val
          return (
            <button
              key={String(opt.val)}
              type="button"
              onClick={() => onChange(opt.val)}
              className={cn(
                'relative rounded-xl border py-2.5 px-4 text-sm font-medium transition-all duration-200',
                selected
                  ? 'border-[#d4a017] bg-[#fdf3d7]/70 text-[#b8860b] shadow-[0_0_0_1px_#d4a017]'
                  : 'border-border bg-white text-muted-foreground hover:border-[#d4a017]/30 hover:bg-[#fdf3d7]/10'
              )}
            >
              {opt.lbl}
              {selected && <GoldenCheck />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                isSelected
                  ? 'border-[#d4a017] bg-[#fdf3d7] text-[#b8860b]'
                  : 'border-border bg-white text-muted-foreground hover:border-[#d4a017]/30'
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StudentPersonaSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-4">
      <BooleanPair
        label="Do you have an emergency buffer so a surprise expense will not cause a default?"
        value={store.hasEmergencyFund}
        onChange={(v) => store.updateField('hasEmergencyFund', v)}
      />
      <BooleanPair
        label="Would you consider a secured card to build credit faster?"
        value={store.willingSecuredCard}
        onChange={(v) => store.updateField('willingSecuredCard', v)}
      />
      {store.willingSecuredCard && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">How much can you deposit for a secured card?</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">INR</span>
            <input
              type="number"
              min={5000}
              max={200000}
              step={5000}
              value={store.fdAmount || ''}
              onChange={(e) => store.updateField('fdAmount', Number(e.target.value) || 0)}
              placeholder="e.g. 25000"
              className={cn('w-full rounded-xl border border-border bg-white pl-12 pr-3 py-2 text-sm tabular-nums focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30', HIDE_SPINNERS)}
            />
          </div>
        </div>
      )}
      <BooleanPair
        label="Is a clear upgrade path to a better card within 12 to 24 months important?"
        value={store.upgradePathImportant}
        onChange={(v) => store.updateField('upgradePathImportant', v)}
      />
    </div>
  )
}

function SalariedPersonaSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Existing credit cards (if any)</p>
        <input
          type="text"
          placeholder="e.g. HDFC Millennia, SBI SimplySave"
          value={store.existingCards.join(', ')}
          onChange={(e) => store.updateField('existingCards', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30"
        />
        <p className="text-[11px] text-muted-foreground">Comma-separated names of cards you currently hold.</p>
      </div>
      <BooleanPair
        label="Do you have fixed deposits with any bank?"
        value={store.hasFD}
        onChange={(v) => store.updateField('hasFD', v)}
      />
      {store.hasFD && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Total FD amount</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">INR</span>
            <input
              type="number"
              min={10000}
              max={20000000}
              step={10000}
              value={store.fdAmount || ''}
              onChange={(e) => store.updateField('fdAmount', Number(e.target.value) || 0)}
              placeholder="e.g. 500000"
              className={cn('w-full rounded-xl border border-border bg-white pl-12 pr-3 py-2 text-sm tabular-nums focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30', HIDE_SPINNERS)}
            />
          </div>
        </div>
      )}
      <RewardPreferenceSection />
    </div>
  )
}

function TravellerPersonaSection() {
  const store = useAdvisorStore()
  const FREQ_OPTIONS = [
    { value: 'rarely', label: 'Rarely', desc: 'Under 2 trips a year' },
    { value: 'occasionally', label: 'Occasionally', desc: '3 to 6 trips a year' },
    { value: 'frequently', label: 'Frequently', desc: 'Monthly or more' },
  ]
  const AIRLINES = ['Air India', 'IndiGo', 'Vistara', 'SpiceJet', 'GoFirst', 'AirAsia', 'International']

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <p className="text-sm font-medium text-foreground">How often do you travel?</p>
        <div className="grid grid-cols-3 gap-2">
          {FREQ_OPTIONS.map((opt) => {
            const selected = store.travelFrequency === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => store.updateField('travelFrequency', opt.value)}
                className={cn(
                  'relative rounded-xl border p-3 text-left transition-all duration-200',
                  selected
                    ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                    : 'border-border bg-white hover:border-[#d4a017]/30'
                )}
              >
                <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                {selected && <GoldenCheck />}
              </button>
            )
          })}
        </div>
      </div>
      <ChipGroup
        label="Preferred airlines"
        options={AIRLINES}
        selected={store.preferredAirlines}
        onToggle={(a) => {
          const current = store.preferredAirlines
          const selected = current.includes(a)
          store.updateField('preferredAirlines', selected ? current.filter((x) => x !== a) : [...current, a])
        }}
      />
    </div>
  )
}

function OnlineShopperPersonaSection() {
  const store = useAdvisorStore()
  const PLATFORMS = ['Amazon', 'Flipkart', 'Myntra', 'Swiggy', 'Zomato', 'BigBasket', 'BookMyShow', 'Uber / Ola', 'Apple / Google Store']
  return (
    <div className="space-y-4">
      <ChipGroup
        label="Platforms you use most"
        options={PLATFORMS}
        selected={store.preferredPlatforms}
        onToggle={(p) => {
          const current = store.preferredPlatforms
          const isSelected = current.includes(p)
          store.updateField('preferredPlatforms', isSelected ? current.filter((x) => x !== p) : [...current, p])
        }}
      />
      <RewardPreferenceSection />
    </div>
  )
}

function SelfEmployedPersonaSection() {
  const store = useAdvisorStore()
  const BIZ_CATS = ['Inventory / Stock', 'Advertising', 'Software / SaaS', 'Travel', 'Fuel', 'Utilities', 'Vendor Payments', 'Office Supplies']
  return (
    <div className="space-y-4">
      <BooleanPair
        label="Do you want to separate personal and business expenses?"
        value={store.wantsSeparateBusinessCard}
        onChange={(v) => store.updateField('wantsSeparateBusinessCard', v)}
      />
      <ChipGroup
        label="Major business expense categories"
        options={BIZ_CATS}
        selected={store.businessExpenseCategories}
        onToggle={(cat) => {
          const current = store.businessExpenseCategories
          const isSelected = current.includes(cat)
          store.updateField('businessExpenseCategories', isSelected ? current.filter((c) => c !== cat) : [...current, cat])
        }}
      />
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Existing credit cards</p>
        <input
          type="text"
          placeholder="e.g. HDFC Biz, Amex Business Gold"
          value={store.existingCards.join(', ')}
          onChange={(e) => store.updateField('existingCards', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30"
        />
      </div>
    </div>
  )
}

function RewardsMaximizerPersonaSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-4">
      <RewardPreferenceSection />
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-foreground">Existing credit cards</p>
        <input
          type="text"
          placeholder="e.g. HDFC Diners Black, Amex Plat"
          value={store.existingCards.join(', ')}
          onChange={(e) => store.updateField('existingCards', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30"
        />
      </div>
    </div>
  )
}

function CreditBuilderPersonaSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-4">
      <BooleanPair
        label="Is reducing existing debt your primary objective right now?"
        value={store.debtReductionPrimary}
        onChange={(v) => store.updateField('debtReductionPrimary', v)}
      />
      <BooleanPair
        label="Are you willing to start with a secured or low-limit card?"
        value={store.willingSecuredCard}
        onChange={(v) => store.updateField('willingSecuredCard', v)}
      />
      {store.willingSecuredCard && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground">Deposit amount you can lock</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">INR</span>
            <input
              type="number"
              min={5000}
              max={200000}
              step={5000}
              value={store.fdAmount || ''}
              onChange={(e) => store.updateField('fdAmount', Number(e.target.value) || 0)}
              placeholder="e.g. 25000"
              className={cn('w-full rounded-xl border border-border bg-white pl-12 pr-3 py-2 text-sm tabular-nums focus:border-[#d4a017] focus:outline-none focus:ring-1 focus:ring-[#d4a017]/30', HIDE_SPINNERS)}
            />
          </div>
        </div>
      )}
      <BooleanPair
        label="Is a clear upgrade path to a rewards card within 12 to 24 months important?"
        value={store.upgradePathImportant}
        onChange={(v) => store.updateField('upgradePathImportant', v)}
      />
    </div>
  )
}

function RewardPreferenceSection() {
  const store = useAdvisorStore()
  const PREFS = [
    { value: 'cashback', label: 'Plain cashback', desc: 'Direct statement or bank credit' },
    { value: 'points', label: 'Flexible points', desc: 'Redeemable for travel, shopping, or transfers' },
    { value: 'miles', label: 'Airline miles', desc: 'Best for frequent flyers' },
    { value: 'vouchers', label: 'Shopping vouchers', desc: 'Amazon, Flipkart gift cards' },
  ]
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-foreground">Preferred reward type</p>
      <div className="grid grid-cols-2 gap-2">
        {PREFS.map((opt) => {
          const selected = store.preferredRewardType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => store.updateField('preferredRewardType', opt.value)}
              className={cn(
                'relative rounded-xl border p-3 text-left transition-all duration-200',
                selected
                  ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                  : 'border-border bg-white hover:border-[#d4a017]/30'
              )}
            >
              <p className="text-xs font-semibold text-foreground pr-5">{opt.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
              {selected && <GoldenCheck />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function GoalsStep() {
  const store = useAdvisorStore()
  const persona = store.detectedPersona

  return (
    <div className="space-y-6">
      {/* Primary Goal */}
      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-foreground">Primary goal</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GOAL_OPTIONS.map((goal) => {
            const selected = store.primaryGoal === goal.value
            return (
              <button
                key={goal.value}
                type="button"
                onClick={() => store.updateField('primaryGoal', goal.value)}
                className={cn(
                  'relative rounded-xl border p-3 text-left transition-all duration-200',
                  selected
                    ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                    : 'border-border bg-white hover:border-[#d4a017]/40 hover:bg-[#fdf3d7]/20'
                )}
              >
                <p className="text-xs font-semibold text-foreground leading-snug pr-4">{goal.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{goal.description}</p>
                {selected && <GoldenCheck />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Secondary Goals */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Secondary benefits you value</p>
          <span className="text-xs text-muted-foreground">Select any that apply</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SECONDARY_GOALS.map((goal) => {
            const selected = store.secondaryGoals.includes(goal)
            return (
              <button
                key={goal}
                type="button"
                onClick={() => store.toggleSecondaryGoal(goal)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  selected
                    ? 'border-[#d4a017] bg-[#fdf3d7] text-[#b8860b]'
                    : 'border-border bg-white text-muted-foreground hover:border-[#d4a017]/30 hover:bg-[#fdf3d7]/20'
                )}
              >
                {goal}
              </button>
            )
          })}
        </div>
      </div>

      {/* Card complexity */}
      <div className="space-y-2.5">
        <p className="text-sm font-semibold text-foreground">How many cards are you willing to manage?</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {COMPLEXITY_OPTIONS.map((opt) => {
            const selected = store.cardComplexity === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => store.updateField('cardComplexity', opt.value)}
                className={cn(
                  'relative rounded-xl border p-3.5 text-left transition-all duration-200',
                  selected
                    ? 'border-[#d4a017] bg-[#fdf3d7]/70 shadow-[0_0_0_1px_#d4a017]'
                    : 'border-border bg-white hover:border-[#d4a017]/40 hover:bg-[#fdf3d7]/20'
                )}
              >
                <p className="text-sm font-semibold text-foreground pr-5">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                {selected && <GoldenCheck />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Persona follow-up — shown if persona is detected */}
      {persona && (
        <div className="rounded-xl border border-[#d4a017]/30 bg-[#fdf3d7]/30 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#b8860b]">
              <path d="M7 1L8.8 4.7L13 5.3L10 8.2L10.7 12.4L7 10.5L3.3 12.4L4 8.2L1 5.3L5.2 4.7L7 1Z" fill="#b8860b" strokeLinejoin="round"/>
            </svg>
            <p className="text-xs font-semibold text-[#b8860b] uppercase tracking-wide">
              {PERSONA_LABELS[persona]}
            </p>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            A few more details to fine-tune your recommendation.
          </p>

          {persona === 'student_firsttime' && <StudentPersonaSection />}
          {persona === 'salaried_everyday' && <SalariedPersonaSection />}
          {persona === 'rewards_maximizer' && <RewardsMaximizerPersonaSection />}
          {persona === 'frequent_traveller' && <TravellerPersonaSection />}
          {persona === 'online_shopper' && <OnlineShopperPersonaSection />}
          {persona === 'self_employed' && <SelfEmployedPersonaSection />}
          {persona === 'credit_builder' && <CreditBuilderPersonaSection />}
        </div>
      )}
    </div>
  )
}
