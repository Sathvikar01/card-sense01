'use client'

import { useAdvisorStore, type UserPersona } from '@/lib/store/advisor-store'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

/* ------------------------------------------------------------------ */
/*  Persona heading config                                             */
/* ------------------------------------------------------------------ */

const PERSONA_CONFIG: Record<UserPersona, { title: string; description: string }> = {
  student_firsttime: {
    title: 'Starting your credit journey',
    description: 'A few more details so we can find the safest entry point with room to grow.',
  },
  salaried_everyday: {
    title: 'Your daily spending habits',
    description: 'Let us fine-tune the recommendation for your main card.',
  },
  rewards_maximizer: {
    title: 'Maximizing your returns',
    description: 'To find cards that outperform, we need to understand your redemption preferences.',
  },
  frequent_traveller: {
    title: 'Your travel profile',
    description: 'Travel cards vary widely. These details help us match the right ecosystem.',
  },
  online_shopper: {
    title: 'Your digital spending',
    description: 'Different platforms partner with different banks. Let us find the best overlap.',
  },
  self_employed: {
    title: 'Business and personal',
    description: 'Separating finances and matching expense categories to the right card features.',
  },
  credit_builder: {
    title: 'Rebuilding your credit',
    description: 'We will focus on low-risk cards with clear upgrade paths and minimal cost.',
  },
}

/* ------------------------------------------------------------------ */
/*  Sections per persona                                               */
/* ------------------------------------------------------------------ */

function StudentSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-6">
      <BooleanToggle
        label="Do you have an emergency buffer so a surprise expense won't cause a default?"
        value={store.hasEmergencyFund}
        onChange={(v) => store.updateField('hasEmergencyFund', v)}
      />
      <BooleanToggle
        label="Would you consider a secured card if it helps you build credit faster?"
        value={store.willingSecuredCard}
        onChange={(v) => store.updateField('willingSecuredCard', v)}
      />
      {store.willingSecuredCard && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              How much can you deposit for a secured card?
            </Label>
            <span className="text-sm font-semibold tabular-nums text-primary">
              INR {store.fdAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <Slider
            value={[store.fdAmount]}
            onValueChange={([v]) => store.updateField('fdAmount', v)}
            min={5000}
            max={200000}
            step={5000}
          />
        </div>
      )}
      <BooleanToggle
        label="Is having a clear upgrade path to a better card important to you?"
        value={store.upgradePathImportant}
        onChange={(v) => store.updateField('upgradePathImportant', v)}
      />
    </div>
  )
}

function SalariedSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Existing credit cards (if any)</Label>
        <Input
          placeholder="e.g. HDFC Millennia, SBI SimplySave"
          value={store.existingCards.join(', ')}
          onChange={(e) =>
            store.updateField('existingCards', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
          }
          className="rounded-xl"
        />
        <p className="text-xs text-muted-foreground">Comma separated names of cards you currently hold.</p>
      </div>
      <BooleanToggle
        label="Do you have fixed deposits with any bank?"
        value={store.hasFD}
        onChange={(v) => store.updateField('hasFD', v)}
      />
      {store.hasFD && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Total FD amount</Label>
            <span className="text-sm font-semibold tabular-nums text-primary">
              INR {store.fdAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <Slider
            value={[store.fdAmount]}
            onValueChange={([v]) => store.updateField('fdAmount', v)}
            min={10000}
            max={2000000}
            step={10000}
          />
        </div>
      )}
      <RewardPreference />
    </div>
  )
}

function RewardsMaximizerSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-6">
      <RewardPreference />
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Existing credit cards</Label>
        <Input
          placeholder="e.g. HDFC Diners Black, Amex Plat"
          value={store.existingCards.join(', ')}
          onChange={(e) =>
            store.updateField('existingCards', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
          }
          className="rounded-xl"
        />
      </div>
      <BooleanToggle
        label="Are you sensitive to reward devaluations or program changes over time?"
        value={store.upgradePathImportant}
        onChange={(v) => store.updateField('upgradePathImportant', v)}
      />
    </div>
  )
}

function TravellerSection() {
  const store = useAdvisorStore()
  const FREQ_OPTIONS = [
    { value: 'rarely', label: 'Rarely', desc: 'Less than 2 trips a year' },
    { value: 'occasionally', label: 'Occasionally', desc: '3 to 6 trips a year' },
    { value: 'frequently', label: 'Frequently', desc: 'Monthly or more' },
  ]
  const AIRLINES = ['Air India', 'IndiGo', 'Vistara', 'SpiceJet', 'GoFirst', 'AirAsia', 'International carriers']

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">How often do you travel?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {FREQ_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => store.updateField('travelFrequency', opt.value)}
              className={cn(
                'rounded-xl border p-3.5 text-left transition-all duration-200',
                store.travelFrequency === opt.value
                  ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                  : 'border-border hover:border-border/80 hover:bg-muted/40'
              )}
            >
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Preferred airlines</Label>
        <div className="flex flex-wrap gap-2">
          {AIRLINES.map((airline) => {
            const selected = store.preferredAirlines.includes(airline)
            return (
              <button
                key={airline}
                type="button"
                onClick={() => {
                  const current = store.preferredAirlines
                  store.updateField(
                    'preferredAirlines',
                    selected ? current.filter((a) => a !== airline) : [...current, airline]
                  )
                }}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                  selected
                    ? 'border-primary/50 bg-primary/[0.08] text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/40'
                )}
              >
                {airline}
              </button>
            )
          })}
        </div>
      </div>
      <BooleanToggle
        label="Do you need strong travel insurance, trip cancellation, and baggage coverage?"
        value={store.hasEmergencyFund}
        onChange={(v) => store.updateField('hasEmergencyFund', v)}
      />
    </div>
  )
}

function OnlineShopperSection() {
  const store = useAdvisorStore()
  const PLATFORMS = ['Amazon', 'Flipkart', 'Myntra', 'Swiggy', 'Zomato', 'BigBasket', 'BookMyShow', 'Uber / Ola', 'Apple / Google Store']

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Platforms you use most</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const selected = store.preferredPlatforms.includes(p)
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  const current = store.preferredPlatforms
                  store.updateField(
                    'preferredPlatforms',
                    selected ? current.filter((x) => x !== p) : [...current, p]
                  )
                }}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                  selected
                    ? 'border-primary/50 bg-primary/[0.08] text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/40'
                )}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>
      <RewardPreference />
    </div>
  )
}

function SelfEmployedSection() {
  const store = useAdvisorStore()
  const BIZ_CATS = ['Inventory / Stock', 'Advertising & Marketing', 'Software & SaaS', 'Travel', 'Fuel & Logistics', 'Utilities', 'Vendor Payments', 'Office Supplies']

  return (
    <div className="space-y-6">
      <BooleanToggle
        label="Do you want to separate personal and business expenses?"
        value={store.wantsSeparateBusinessCard}
        onChange={(v) => store.updateField('wantsSeparateBusinessCard', v)}
      />
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Major business expense categories</Label>
        <div className="flex flex-wrap gap-2">
          {BIZ_CATS.map((cat) => {
            const selected = store.businessExpenseCategories.includes(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const current = store.businessExpenseCategories
                  store.updateField(
                    'businessExpenseCategories',
                    selected ? current.filter((c) => c !== cat) : [...current, cat]
                  )
                }}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
                  selected
                    ? 'border-primary/50 bg-primary/[0.08] text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/40'
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Existing credit cards</Label>
        <Input
          placeholder="e.g. HDFC Biz, Amex Business Gold"
          value={store.existingCards.join(', ')}
          onChange={(e) =>
            store.updateField('existingCards', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
          }
          className="rounded-xl"
        />
      </div>
    </div>
  )
}

function CreditBuilderSection() {
  const store = useAdvisorStore()
  return (
    <div className="space-y-6">
      <BooleanToggle
        label="Is reducing existing debt your primary objective right now?"
        value={store.debtReductionPrimary}
        onChange={(v) => store.updateField('debtReductionPrimary', v)}
      />
      <BooleanToggle
        label="Are you willing to start with a secured or low-limit card?"
        value={store.willingSecuredCard}
        onChange={(v) => store.updateField('willingSecuredCard', v)}
      />
      {store.willingSecuredCard && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Deposit amount you can lock</Label>
            <span className="text-sm font-semibold tabular-nums text-primary">
              INR {store.fdAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <Slider
            value={[store.fdAmount]}
            onValueChange={([v]) => store.updateField('fdAmount', v)}
            min={5000}
            max={200000}
            step={5000}
          />
        </div>
      )}
      <BooleanToggle
        label="Do you have an emergency fund to avoid defaulting?"
        value={store.hasEmergencyFund}
        onChange={(v) => store.updateField('hasEmergencyFund', v)}
      />
      <BooleanToggle
        label="Is a clear upgrade path to a rewards card important within 12-24 months?"
        value={store.upgradePathImportant}
        onChange={(v) => store.updateField('upgradePathImportant', v)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared helper components                                           */
/* ------------------------------------------------------------------ */

function BooleanToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4 bg-muted/20">
      <Label className="text-sm font-medium text-foreground cursor-pointer flex-1">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}

function RewardPreference() {
  const store = useAdvisorStore()
  const PREFS = [
    { value: 'cashback', label: 'Plain cashback', desc: 'Direct statement credit or bank account credit' },
    { value: 'points', label: 'Flexible bank points', desc: 'Redeemable for travel, shopping, or transfers' },
    { value: 'miles', label: 'Airline miles', desc: 'Best for frequent flyers and premium cabin redemptions' },
    { value: 'vouchers', label: 'Shopping vouchers', desc: 'Gift cards for Amazon, Flipkart, etc.' },
  ]
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">Preferred reward type</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PREFS.map((opt) => {
          const selected = store.preferredRewardType === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => store.updateField('preferredRewardType', opt.value)}
              className={cn(
                'relative rounded-xl border p-3.5 text-left transition-all duration-200',
                selected
                  ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                  : 'border-border hover:border-border/80 hover:bg-muted/40'
              )}
            >
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
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

export function PersonaStep() {
  const store = useAdvisorStore()
  const persona = store.detectedPersona

  if (!persona || !PERSONA_CONFIG[persona]) {
    return (
      <div className="space-y-4 text-center py-8">
        <p className="text-sm text-muted-foreground">Detecting your profile type...</p>
      </div>
    )
  }

  const config = PERSONA_CONFIG[persona]
  const PERSONA_LABELS: Record<UserPersona, string> = {
    student_firsttime: 'Student / First-time user',
    salaried_everyday: 'Salaried professional',
    rewards_maximizer: 'Rewards maximizer',
    frequent_traveller: 'Frequent traveller',
    online_shopper: 'Online shopper',
    self_employed: 'Self-employed / Business',
    credit_builder: 'Credit builder',
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/[0.05] px-3 py-1 text-xs font-medium text-primary mb-3">
          {PERSONA_LABELS[persona]}
        </div>
        <h2 className="text-xl font-semibold text-foreground tracking-tight">{config.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
      </div>

      {persona === 'student_firsttime' && <StudentSection />}
      {persona === 'salaried_everyday' && <SalariedSection />}
      {persona === 'rewards_maximizer' && <RewardsMaximizerSection />}
      {persona === 'frequent_traveller' && <TravellerSection />}
      {persona === 'online_shopper' && <OnlineShopperSection />}
      {persona === 'self_employed' && <SelfEmployedSection />}
      {persona === 'credit_builder' && <CreditBuilderSection />}
    </div>
  )
}
