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

/** Category shares as plain rows: name, amount, share. No bars, no tracks. */
export function CategoryList({ data }: { data: CategoryShare[] }) {
  return (
    <ul>
      {data.map((item) => (
        <li key={item.category} className="row py-2.5 text-sm">
          <span className="flex-1 truncate">{LABELS[item.category] || item.category.replace(/_/g, ' ')}</span>
          <span className="tabular-nums">₹{Math.round(item.amount).toLocaleString('en-IN')}</span>
          <span className="w-10 text-right tabular-nums text-muted-foreground">{item.percentage}%</span>
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
