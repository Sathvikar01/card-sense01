const LABELS: Record<string, string> = {
  dining: 'Dining',
  groceries: 'Groceries',
  shopping: 'Shopping',
  online_shopping: 'Online shopping',
  travel: 'Travel',
  fuel: 'Fuel',
  utilities: 'Utilities',
  rent: 'Rent',
  emi: 'EMI',
  entertainment: 'Entertainment',
  healthcare: 'Health',
  education: 'Education',
  insurance: 'Insurance',
  investments: 'Investments',
  other: 'Other',
}

export interface CategoryShare {
  category: string
  amount: number
  percentage: number
}

/** Category shares as gold bars. Labels carry the numbers, so the bars never need a scale. */
export function CategoryBars({ data }: { data: CategoryShare[] }) {
  return (
    <ul className="space-y-1 px-4 py-3">
      {data.map((item) => (
        <li key={item.category} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-4 py-1.5 text-sm sm:grid-cols-[9rem_1fr_2.5rem]">
          <span className="truncate">{LABELS[item.category] || item.category.replace(/_/g, ' ')}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-gold" style={{ width: `${Math.max(item.percentage, 2)}%` }} />
          </span>
          <span className="text-right tabular-nums text-muted-foreground">{item.percentage}%</span>
        </li>
      ))}
    </ul>
  )
}

/** Turns raw transactions into the top category shares. */
export function toCategoryShares(rows: Array<{ category: string | null; amount: number }>, limit = 8): CategoryShare[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const key = row.category || 'other'
    totals.set(key, (totals.get(key) || 0) + Number(row.amount))
  }
  const total = [...totals.values()].reduce((sum, v) => sum + v, 0)
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount, percentage: total > 0 ? Math.round((amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}
