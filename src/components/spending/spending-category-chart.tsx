'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface Transaction {
  id: string
  amount: number
  category: string
  merchant_name: string | null
  transaction_date: string
  description: string | null
}

interface SpendingCategoryChartProps {
  transactions: Transaction[]
}

const CATEGORY_COLORS: Record<string, string> = {
  dining: '#ea580c',
  shopping: '#ec4899',
  travel: '#3b82f6',
  groceries: '#22c55e',
  entertainment: '#a855f7',
  fuel: '#f59e0b',
  utilities: '#06b6d4',
  rent: '#8b5cf6',
  healthcare: '#ef4444',
  education: '#6366f1',
  insurance: '#14b8a6',
  emi: '#d946ef',
  investments: '#0ea5e9',
  other: '#6b7280',
}

interface TooltipPayloadItem {
  name: string
  value: number
  payload: { name: string; value: number; percentage: string }
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (active && payload && payload.length > 0) {
    const item = payload[0]
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium capitalize text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {'\u20B9'}{item.value.toLocaleString('en-IN')} ({item.payload.percentage})
        </p>
      </div>
    )
  }
  return null
}

export function SpendingCategoryChart({ transactions }: SpendingCategoryChartProps) {
  const categoryTotals = transactions.reduce<Record<string, number>>((acc, txn) => {
    acc[txn.category] = (acc[txn.category] || 0) + Number(txn.amount)
    return acc
  }, {})

  const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0)

  const data = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category.replace(/_/g, ' '),
      value: amount,
      category,
      percentage: total > 0 ? `${((amount / total) * 100).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 w-full max-w-xs">
            {data.slice(0, 6).map((entry) => (
              <div key={entry.category} className="flex items-center gap-2 text-xs">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other }}
                />
                <span className="capitalize truncate text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-medium text-foreground tabular-nums">{entry.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
