'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, IndianRupee } from 'lucide-react'

export interface FinancialProfileFormData {
  annualIncome: number
  employmentType: string
  primaryBank: string
  city: string
  existingCards: string[]
  fdAmount: number | null
  spending: Record<string, number>
  goals: string[]
}

interface FinancialProfileFormProps {
  onSubmit: (data: FinancialProfileFormData) => void
  isLoading: boolean
}

const BANKS = [
  'HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra',
  'IndusInd Bank', 'Yes Bank', 'IDFC First', 'Federal Bank',
  'RBL Bank', 'AU Small Finance', 'Standard Chartered', 'Citibank', 'Other',
]

const SPENDING_CATEGORIES = [
  { key: 'dining', label: 'Dining & Food Delivery' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'shopping', label: 'Online Shopping' },
  { key: 'travel', label: 'Travel & Transport' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'entertainment', label: 'Entertainment & OTT' },
  { key: 'utilities', label: 'Utilities & Bills' },
  { key: 'other', label: 'Other' },
]

const GOALS = [
  { id: 'cashback', label: 'Cashback' },
  { id: 'travel_rewards', label: 'Travel Rewards' },
  { id: 'lounge_access', label: 'Airport Lounge Access' },
  { id: 'fuel_savings', label: 'Fuel Savings' },
  { id: 'shopping_rewards', label: 'Shopping Rewards' },
  { id: 'low_fees', label: 'Low/No Annual Fee' },
  { id: 'build_credit', label: 'Build Credit History' },
]

const EMPLOYMENT_OPTIONS = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Homemaker / Other' },
] as const

export function FinancialProfileForm({ onSubmit, isLoading }: FinancialProfileFormProps) {
  const [annualIncome, setAnnualIncome] = useState(0)
  const [employmentType, setEmploymentType] = useState('salaried')
  const [primaryBank, setPrimaryBank] = useState('')
  const [city, setCity] = useState('')
  const [existingCards, setExistingCards] = useState('')
  const [hasFD, setHasFD] = useState(false)
  const [fdAmount, setFdAmount] = useState(0)
  const [spending, setSpending] = useState<Record<string, number>>({
    dining: 5000,
    groceries: 8000,
    shopping: 5000,
    travel: 3000,
    fuel: 3000,
    entertainment: 2000,
    utilities: 5000,
    other: 4000,
  })
  const [goals, setGoals] = useState<string[]>([])

  const handleSpendingChange = (key: string, value: number[]) => {
    setSpending((prev) => ({ ...prev, [key]: value[0] }))
  }

  const handleGoalToggle = (goal: string) => {
    setGoals((prev) => (
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      annualIncome,
      employmentType,
      primaryBank,
      city,
      existingCards: existingCards.split(',').map((c) => c.trim()).filter(Boolean),
      fdAmount: hasFD ? fdAmount : null,
      spending,
      goals,
    })
  }

  const totalMonthlySpend = Object.values(spending).reduce((sum, val) => sum + val, 0)
  const needsFlexibleIncomeInput =
    employmentType === 'student' || employmentType === 'unemployed' || employmentType === 'other'
  const incomeLabel = needsFlexibleIncomeInput
    ? 'Annual Personal Income (INR)'
    : 'Annual Income (INR)'
  const incomeHelpText = needsFlexibleIncomeInput
    ? 'You can keep this as 0. Add only your own stipend, part-time income, or documented earnings.'
    : 'Enter your annual pre-tax income used for credit card eligibility checks.'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-purple-600" />
          Financial Profile
        </CardTitle>
        <CardDescription>
          Fill in your details for personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="annual-income">{incomeLabel}</Label>
              <Input
                id="annual-income"
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value)))}
                min={0}
                step={10000}
              />
              <p className="text-xs text-gray-500">{incomeHelpText}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employment-type">Employment Type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary-bank">Primary Bank</Label>
              <Select value={primaryBank} onValueChange={setPrimaryBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="existing-cards">Existing Credit Cards (comma-separated)</Label>
            <Input
              id="existing-cards"
              value={existingCards}
              onChange={(e) => setExistingCards(e.target.value)}
              placeholder="e.g. HDFC Regalia, SBI SimplyCLICK"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <Label>Have Fixed Deposits?</Label>
              <p className="text-xs text-gray-500">
                FD-backed cards are useful for students or users with low/no income proof
              </p>
            </div>
            <Switch checked={hasFD} onCheckedChange={setHasFD} />
          </div>
          {hasFD && (
            <div className="space-y-2">
              <Label htmlFor="fd-amount">FD Amount (INR)</Label>
              <Input
                id="fd-amount"
                type="number"
                value={fdAmount}
                onChange={(e) => setFdAmount(Number(e.target.value))}
                min={0}
                step={10000}
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Monthly Spending Breakdown</Label>
              <span className="text-sm font-medium text-purple-600">
                Total: Rs. {totalMonthlySpend.toLocaleString('en-IN')}/mo
              </span>
            </div>
            {SPENDING_CATEGORIES.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{cat.label}</span>
                  <span className="font-medium">Rs. {spending[cat.key]?.toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  value={[spending[cat.key] || 0]}
                  onValueChange={(val) => handleSpendingChange(cat.key, val)}
                  min={0}
                  max={50000}
                  step={500}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Label>Credit Card Goals</Label>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <label
                  key={goal.id}
                  className="cursor-pointer rounded-lg border p-2 hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={goals.includes(goal.id)}
                      onCheckedChange={() => handleGoalToggle(goal.id)}
                    />
                    <span className="text-sm">{goal.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading || !primaryBank || !city}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Get AI Recommendations'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
