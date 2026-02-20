'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Transaction {
  id: string
  amount: number
  category: string
  merchant_name: string | null
  transaction_date: string
  description: string | null
}

interface SpendingTrendChartProps {
  transactions: Transaction[]
}

interface TrendTooltipPayloadItem {
  value: number
  payload: { month: string }
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: TrendTooltipPayloadItem[] }) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{payload[0].payload.month}</p>
        <p className="text-sm text-muted-foreground">
          {'\u20B9'}{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    )
  }
  return null
}

export function SpendingTrendChart({ transactions }: SpendingTrendChartProps) {
  // Group by month
  const monthlyMap = transactions.reduce<Record<string, { total: number; sortKey: string }>>((acc, txn) => {
    const d = new Date(txn.transaction_date)
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (!acc[label]) acc[label] = { total: 0, sortKey }
    acc[label].total += Number(txn.amount)
    return acc
  }, {})

  const data = Object.entries(monthlyMap)
    .map(([month, { total, sortKey }]) => ({ month, amount: total, sortKey }))
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  if (data.length < 2) return null

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `\u20B9${(value / 1000).toFixed(1)}K`
    return `\u20B9${value}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Trend</CardTitle>
        <p className="text-xs text-muted-foreground">Spending over the last {data.length} months</p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                width={50}
              />
              <Tooltip content={<TrendTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#d4a017"
                strokeWidth={2}
                fill="url(#spendGradient)"
                dot={{ fill: '#d4a017', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#b8860b' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
