import Link from 'next/link'

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

export function CategoryBreakdown({ data, linkToSpending = false }: { data: CategoryShare[]; linkToSpending?: boolean }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{linkToSpending ? 'Spending' : 'By category'}</h2>
        {linkToSpending && (
          <Link href="/spending" className="text-sm text-muted-foreground hover:text-foreground">
            {data.length ? 'View all' : 'Add spending'}
          </Link>
        )}
      </div>

      {data.length === 0 ? (
        <div className="surface px-5 py-10 text-center text-sm text-muted-foreground">No spending yet</div>
      ) : (
        <ul className="surface divide-y divide-border">
          {data.map((item) => (
            <li key={item.category} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-4 px-5 py-3 text-sm sm:grid-cols-[10rem_1fr_3rem]">
              <span className="truncate">{LABELS[item.category] || item.category.replace(/_/g, ' ')}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${item.percentage}%` }} />
              </span>
              <span className="text-right tabular-nums text-muted-foreground">{item.percentage}%</span>
            </li>
          ))}
        </ul>
      )}
    </section>
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
