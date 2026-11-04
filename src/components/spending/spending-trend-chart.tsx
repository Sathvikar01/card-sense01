'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { GOLD, PINE, PINE_70 } from '@/lib/theme'
import { Section } from '@/components/shared/section'

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
      <div className="rounded-xl bg-card px-3 py-2 shadow-lg">
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
    <Section title="By month">
      <div className="px-2 py-3">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fill: PINE_70, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: PINE_70, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
                width={50}
              />
              <Tooltip content={<TrendTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={PINE}
                strokeWidth={1.5}
                fill="url(#spendGradient)"
                dot={false}
                activeDot={{ r: 4, fill: PINE, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  )
}
