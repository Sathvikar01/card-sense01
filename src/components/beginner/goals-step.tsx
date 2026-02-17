// Step 5: Credit Card Goals

'use client'

import { useBeginnerFlowStore } from '@/lib/store/beginner-flow-store'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Target, TrendingUp, DollarSign, Plane, Fuel, ShoppingBag, Tag } from 'lucide-react'

const GOAL_OPTIONS = [
  {
    id: 'build_credit',
    label: 'Build credit history',
    description: 'Start building a positive credit score',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    id: 'cashback',
    label: 'Cashback on daily spends',
    description: 'Get money back on everyday purchases',
    icon: DollarSign,
    color: 'text-emerald-600',
  },
  {
    id: 'travel_rewards',
    label: 'Travel rewards',
    description: 'Earn points for flights and hotels',
    icon: Plane,
    color: 'text-blue-600',
  },
  {
    id: 'fuel_savings',
    label: 'Fuel savings',
    description: 'Save on fuel surcharges and get rewards',
    icon: Fuel,
    color: 'text-red-600',
  },
  {
    id: 'online_shopping',
    label: 'Online shopping rewards',
    description: 'Extra rewards on e-commerce platforms',
    icon: ShoppingBag,
    color: 'text-purple-600',
  },
  {
    id: 'low_fees',
    label: 'Low/no annual fee',
    description: 'Minimize card maintenance costs',
    icon: Tag,
    color: 'text-orange-600',
  },
]

export function GoalsStep() {
  const { goals, updateField } = useBeginnerFlowStore()

  const handleGoalToggle = (goalId: string, checked: boolean) => {
    if (checked) {
      updateField('goals', [...goals, goalId])
    } else {
      updateField('goals', goals.filter((g) => g !== goalId))
    }
  }

  const isGoalSelected = (goalId: string) => goals.includes(goalId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Your Credit Card Goals
        </CardTitle>
        <CardDescription>
          Select what matters most to you (choose at least one)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Goal Options */}
        <div className="grid gap-4 md:grid-cols-2">
          {GOAL_OPTIONS.map((goal) => {
            const Icon = goal.icon
            const selected = isGoalSelected(goal.id)

            return (
              <div
                key={goal.id}
                className={`
                  rounded-lg border-2 p-4 transition-all cursor-pointer
                  ${
                    selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
                onClick={() => handleGoalToggle(goal.id, !selected)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={goal.id}
                    checked={selected}
                    onCheckedChange={(checked) => handleGoalToggle(goal.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${goal.color}`} />
                      <Label
                        htmlFor={goal.id}
                        className="text-sm font-semibold cursor-pointer"
                      >
                        {goal.label}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-600">
                      {goal.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Validation message */}
        {goals.length === 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              Please select at least one goal to help us recommend the best cards for you
            </p>
          </div>
        )}

        {/* Selected goals summary */}
        {goals.length > 0 && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-medium text-green-900 mb-2">
              Selected {goals.length} {goals.length === 1 ? 'goal' : 'goals'}:
            </p>
            <div className="flex flex-wrap gap-2">
              {goals.map((goalId) => {
                const goal = GOAL_OPTIONS.find((g) => g.id === goalId)
                if (!goal) return null
                const Icon = goal.icon

                return (
                  <div
                    key={goalId}
                    className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-green-300"
                  >
                    <Icon className={`h-3 w-3 ${goal.color}`} />
                    <span className="text-xs font-medium text-gray-700">
                      {goal.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Helpful tip */}
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> For your first credit card, we recommend focusing on &quot;Build credit history&quot; and &quot;Low/no annual fee&quot; to start your credit journey safely.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
