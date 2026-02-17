// Step 4: Monthly Spending Breakdown

'use client'

import { useBeginnerFlowStore } from '@/lib/store/beginner-flow-store'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { ShoppingCart, Utensils, ShoppingBag, Fuel, Zap, Film, Plane, Activity } from 'lucide-react'
import type { SpendingBreakdown } from '@/types/financial-profile'

const SPENDING_CATEGORIES = [
  { key: 'groceries' as const, label: 'Groceries', icon: ShoppingCart, color: 'text-green-600' },
  { key: 'dining' as const, label: 'Dining & Restaurants', icon: Utensils, color: 'text-orange-600' },
  { key: 'online_shopping' as const, label: 'Online Shopping', icon: ShoppingBag, color: 'text-purple-600' },
  { key: 'fuel' as const, label: 'Fuel & Transport', icon: Fuel, color: 'text-red-600' },
  { key: 'utilities' as const, label: 'Bills & Utilities', icon: Zap, color: 'text-yellow-600' },
  { key: 'entertainment' as const, label: 'Entertainment', icon: Film, color: 'text-pink-600' },
  { key: 'travel' as const, label: 'Travel', icon: Plane, color: 'text-blue-600' },
  { key: 'other' as const, label: 'Other Expenses', icon: Activity, color: 'text-gray-600' },
]

export function SpendingStep() {
  const { spending, updateSpending, getTotalMonthlySpend } = useBeginnerFlowStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSpendingChange = (category: keyof SpendingBreakdown, value: number[]) => {
    updateSpending(category, value[0])
  }

  const totalSpend = getTotalMonthlySpend()

  // Calculate percentages for visual breakdown
  const getPercentage = (amount: number) => {
    if (totalSpend === 0) return 0
    return Math.round((amount / totalSpend) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Monthly Spending
        </CardTitle>
        <CardDescription>
          Break down your average monthly spending by category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Total Spending Display */}
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Total Monthly Spending
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sum of all categories below
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(totalSpend)}
            </div>
          </div>
        </div>

        {/* Spending Sliders */}
        <div className="space-y-6">
          {SPENDING_CATEGORIES.map((category) => {
            const Icon = category.icon
            const amount = spending[category.key]
            const percentage = getPercentage(amount)

            return (
              <div key={category.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${category.color}`} />
                    <Label htmlFor={category.key} className="text-sm font-medium">
                      {category.label}
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {percentage}%
                    </span>
                    <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-right">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>

                <Slider
                  id={category.key}
                  min={0}
                  max={50000}
                  step={500}
                  value={[amount]}
                  onValueChange={(value) => handleSpendingChange(category.key, value)}
                  className="py-2"
                />

                {/* Visual bar representation */}
                {percentage > 0 && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Helpful tip */}
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Be honest about your spending. We&apos;ll recommend cards that maximize rewards based on where you spend the most. You can adjust these later.
          </p>
        </div>

        {/* Top spending categories */}
        {totalSpend > 0 && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Your Top Spending Categories:
            </p>
            <div className="space-y-1">
              {SPENDING_CATEGORIES
                .filter((cat) => spending[cat.key] > 0)
                .sort((a, b) => spending[b.key] - spending[a.key])
                .slice(0, 3)
                .map((cat) => {
                  const Icon = cat.icon
                  return (
                    <div key={cat.key} className="flex items-center gap-2 text-sm text-blue-800">
                      <Icon className={`h-3 w-3 ${cat.color}`} />
                      <span>{cat.label}</span>
                      <span className="font-semibold">({formatCurrency(spending[cat.key])})</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
