'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

interface CategoryDataPoint {
  category: string
  amount: number
  percentage: number
}

interface SpendingSummaryChartProps {
  data: CategoryDataPoint[]
}

const CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining',
  groceries: 'Groceries',
  shopping: 'Shopping',
  travel: 'Travel',
  fuel: 'Fuel',
  utilities: 'Utilities',
  rent: 'Rent/EMI',
  emi: 'EMI',
  entertainment: 'Entertain.',
  healthcare: 'Health',
  education: 'Education',
  other: 'Other',
  insurance: 'Insurance',
  investments: 'Invest.',
}

interface TooltipPayloadItem {
  value: number
  payload: CategoryDataPoint
}

interface CategoryTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

function CategoryTooltip({ active, payload }: CategoryTooltipProps) {
  if (active && payload && payload.length > 0) {
    const { category, amount, percentage } = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground capitalize">
          {CATEGORY_LABELS[category] || category}
        </p>
        <p className="text-sm text-muted-foreground">
          Share:{' '}
          <span className="font-semibold text-[#b8860b]">{percentage}%</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Avg: ₹{amount.toLocaleString('en-IN')}
        </p>
      </div>
    )
  }
  return null
}

export function SpendingSummaryChart({ data }: SpendingSummaryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Spending Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <TrendingUp className="h-16 w-16 mb-4 text-muted-foreground/30" />
            <p className="text-sm font-medium">No spending data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Track your spending to see insights here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const topCategory = data[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spending Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          % of avg monthly expenditure by category
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                tickFormatter={(val: string) => CATEGORY_LABELS[val] || val}
                interval={0}
              />
              <YAxis
                unit="%"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CategoryTooltip />} cursor={{ stroke: '#d4a017', strokeWidth: 1, strokeDasharray: '4 2' }} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#d4a017"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#d4a017', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#b8860b', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Top Category</p>
            <p className="text-sm font-semibold text-foreground capitalize">
              {CATEGORY_LABELS[topCategory.category] || topCategory.category}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Top Share</p>
            <p className="text-sm font-semibold text-foreground">{topCategory.percentage}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Categories</p>
            <p className="text-sm font-semibold text-foreground">{data.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
