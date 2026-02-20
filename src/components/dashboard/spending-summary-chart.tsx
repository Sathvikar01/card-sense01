'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface SpendingSummaryChartProps {
  data: Array<{
    month: string
    amount: number
  }>
}

interface TooltipPayloadItem {
  value: number
  payload: {
    month: string
  }
}

interface SpendingTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

function SpendingTooltip({ active, payload }: SpendingTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900">{payload[0].payload.month}</p>
        <p className="text-sm text-gray-600">
          Amount:{' '}
          <span className="font-semibold text-[#b8860b]">
            {'\u20B9'}{payload[0].value.toLocaleString('en-IN')}
          </span>
        </p>
      </div>
    )
  }
  return null
}

export function SpendingSummaryChart({ data }: SpendingSummaryChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `\u20B9${(value / 100000).toFixed(1)}L`
    } else if (value >= 1000) {
      return `\u20B9${(value / 1000).toFixed(1)}K`
    }
    return `\u20B9${value}`
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Spending Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <TrendingUp className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-sm font-medium">No spending data yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Track your spending to see insights here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spending Summary
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Last {data.length} months spending trend
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<SpendingTooltip />} cursor={{ fill: 'rgba(212, 160, 23, 0.1)' }} />
              <Bar
                dataKey="amount"
                fill="#d4a017"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-500">Average</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(
                data.reduce((sum, item) => sum + item.amount, 0) / data.length
              )}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Highest</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(Math.max(...data.map((item) => item.amount)))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
