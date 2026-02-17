// Step 2: Income & Employment

'use client'

import { useBeginnerFlowStore } from '@/lib/store/beginner-flow-store'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Wallet } from 'lucide-react'

const EMPLOYMENT_TYPES = [
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business', label: 'Business Owner' },
  { value: 'student', label: 'Student' },
  { value: 'freelancer', label: 'Freelancer' },
] as const

type EmploymentOptionValue = (typeof EMPLOYMENT_TYPES)[number]['value']

export function IncomeStep() {
  const { employmentType, monthlyIncome, annualIncome, updateField } = useBeginnerFlowStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatLakhs = (amount: number) => {
    const lakhs = amount / 100000
    return `${lakhs.toFixed(2)} L`
  }

  const isStudent = employmentType === 'student'

  const handleEmploymentChange = (value: string) => {
    updateField('employmentType', value as EmploymentOptionValue)
  }

  const handleIncomeChange = (values: number[]) => {
    updateField('monthlyIncome', values[0])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          Income & Employment
        </CardTitle>
        <CardDescription>
          This helps us match cards with realistic approval chances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="employmentType">
            Employment Type <span className="text-red-500">*</span>
          </Label>
          <Select value={employmentType} onValueChange={handleEmploymentChange}>
            <SelectTrigger id="employmentType" className="max-w-md">
              <SelectValue placeholder="Select your employment type" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="monthlyIncome">
              Monthly Personal Income <span className="text-red-500">*</span>
            </Label>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyIncome)}
              </div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
          </div>

          <Slider
            id="monthlyIncome"
            min={0}
            max={500000}
            step={2500}
            value={[monthlyIncome]}
            onValueChange={handleIncomeChange}
            className="py-4"
          />

          <div className="flex justify-between text-sm text-gray-500">
            <span>INR 0</span>
            <span>INR 5,00,000</span>
          </div>

          <p className="text-xs text-gray-600">
            {isStudent
              ? 'No personal income is valid. Keep this at 0 if you do not earn yet.'
              : 'Enter only your own income used for eligibility checks.'}
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Estimated Annual Income
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Auto-calculated from monthly income
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(annualIncome)}
              </div>
              <div className="text-sm text-blue-600">
                ({formatLakhs(annualIncome)})
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong>{' '}
            {isStudent
              ? 'Students can still qualify via FD-backed secured cards even with zero income.'
              : 'Many entry-level unsecured cards expect stable income, while FD-backed cards can work with lower income proof.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
