'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { SpendingCategoryChart } from '@/components/spending/spending-category-chart'
import { SpendingTrendChart } from '@/components/spending/spending-trend-chart'

interface Transaction {
  id: string
  amount: number
  category: string
  merchant_name: string | null
  transaction_date: string
  description: string | null
}

// Keys must match the DB check constraint: dining | groceries | travel | fuel | shopping | entertainment | utilities | healthcare | education | insurance | rent | emi | investments | other
const SPENDING_CATEGORIES = [
  {
    key: 'groceries',
    label: 'Groceries',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 2h1.5l2 8h9l1.5-5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="13.5" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    key: 'fuel',
    label: 'Fuel',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 16V5a1 1 0 011-1h6a1 1 0 011 1v11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M2 16h12M5 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M14 6l2 2v5a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'dining',
    label: 'Dining',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M6 2v4a2 2 0 01-2 2v8M10 2v3c0 1.5 1 2.5 2 3V16M12 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'travel',
    label: 'Travel',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 13h14M3.5 13L7 6l4.5 3L15 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 16h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'shopping',
    label: 'Online Shopping',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="5" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'utilities',
    label: 'Utilities & Bills',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2v2M9 14v2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M2 9h2M14 9h2M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    key: 'rent',
    label: 'Rent / EMI',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9L9 2l7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 8v8h10V8M7 16v-4h4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'entertainment',
    label: 'Entertainment',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 16h6M9 13v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M7 7.5l4 2-4 2v-4z" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: 'healthcare',
    label: 'Healthcare',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 7v4M7 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    key: 'education',
    label: 'Education',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L2 6l7 4 7-4-7-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M5 8v5c1 1 2 1.5 4 1.5s3-.5 4-1.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M16 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'other',
    label: 'Other',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="5" cy="9" r="1.5" fill="currentColor" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
        <circle cx="13" cy="9" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
] as const

export default function SpendingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSpend, setTotalSpend] = useState(0)
  const [transactionCount, setTransactionCount] = useState(0)
  const [showEntry, setShowEntry] = useState(false)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/spending')
      if (response.ok) {
        const data = await response.json()
        const txns = data.transactions || []
        setTransactions(txns)
        setTotalSpend(data.aggregates?.total || 0)
        setTransactionCount(data.aggregates?.count || 0)
        if (txns.length === 0) setShowEntry(true)
      } else {
        setTransactions([])
        setTotalSpend(0)
        setTransactionCount(0)
        setShowEntry(true)
      }
    } catch {
      setTransactions([])
      setShowEntry(true)
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/spending?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Transaction deleted')
        fetchTransactions()
      } else {
        toast.error('Failed to delete transaction')
      }
    } catch {
      toast.error('Error deleting transaction')
    }
  }

  const buildEntries = () => {
    return Object.entries(amounts)
      .filter(([, val]) => val && Number(val) > 0)
      .map(([category, val]) => ({
        category,
        amount: Number(val),
        merchant_name: SPENDING_CATEGORIES.find((c) => c.key === category)?.label ?? category,
        transaction_date: new Date().toISOString().split('T')[0],
        description: `Monthly ${SPENDING_CATEGORIES.find((c) => c.key === category)?.label ?? category} spending`,
      }))
  }

  const handleSaveSpending = async () => {
    const entries = buildEntries()
    if (entries.length === 0) {
      toast.error('Enter at least one spending amount')
      return
    }

    setSaving(true)
    try {
      let successCount = 0
      for (const entry of entries) {
        const res = await fetch('/api/spending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })
        if (res.ok) {
          successCount++
        } else {
          const errText = await res.text().catch(() => '')
          let err: object = {}
          try { err = errText ? (JSON.parse(errText) as object) : {} } catch { err = { raw: errText } }
          console.error('Failed to save entry:', entry.category, 'status:', res.status, err)
        }
      }
      if (successCount > 0) {
        toast.success(`Saved ${successCount} spending ${successCount === 1 ? 'entry' : 'entries'}`)
        setAmounts({})
        setShowEntry(false)
        fetchTransactions()
      } else {
        toast.error('Failed to save. Please try again.')
      }
    } catch {
      toast.error('Error saving spending')
    } finally {
      setSaving(false)
    }
  }

  const entryTotal = Object.values(amounts).reduce((sum, val) => sum + (Number(val) || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Money map</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Spending tracker</h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">See where your money goes, then use that pattern to choose better cards.</p>
        </div>
        <Button
          variant={showEntry ? 'outline' : 'default'}
          className="w-full gap-2 sm:w-auto"
          onClick={() => setShowEntry(!showEntry)}
        >
          <Plus className="h-4 w-4" />
          {showEntry ? 'Close entry' : 'Add monthly spend'}
        </Button>
      </div>

      {showEntry && (
        <section className="border-y border-border py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Monthly spending</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add rough amounts. Leave categories blank when they do not apply.</p>
            </div>
            <p className="text-sm text-muted-foreground">All amounts in INR</p>
          </div>
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {SPENDING_CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3 border-b border-border/70 py-3">
                  <span className="w-6 shrink-0 text-muted-foreground">{cat.icon}</span>
                  <label htmlFor={`spend-${cat.key}`} className="min-w-0 flex-1 cursor-pointer text-sm text-foreground">
                    {cat.label}
                  </label>
                  <div className="relative w-28 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium select-none">&#8377;</span>
                    <Input
                      id={`spend-${cat.key}`}
                      type="number"
                      min={0}
                      step={100}
                      placeholder="0"
                      value={amounts[cat.key] ?? ''}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [cat.key]: e.target.value }))}
                      className="h-9 rounded-md pl-7 text-sm tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Monthly total</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">&#8377;{entryTotal.toLocaleString('en-IN')}</p>
              </div>
              <Button onClick={handleSaveSpending} disabled={saving || entryTotal === 0} className="w-full gap-2 sm:w-auto">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save spending'}
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-6 border-y border-border py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total spending</p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.04em] tabular-nums text-foreground">&#8377;{totalSpend.toLocaleString('en-IN')}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-10 gap-y-4 sm:min-w-[330px]">
          <div><dt className="text-xs text-muted-foreground">Transactions</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{transactionCount}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Average entry</dt><dd className="mt-1 text-lg font-semibold tabular-nums">&#8377;{transactionCount > 0 ? Math.round(totalSpend / transactionCount).toLocaleString('en-IN') : 0}</dd></div>
        </dl>
      </section>

      {transactions.length > 0 && (
        <section className="space-y-10 border-b border-border pb-8">
          <div className="mx-auto w-full max-w-xl">
            <SpendingCategoryChart transactions={transactions} />
          </div>
          <div className="mx-auto w-full max-w-3xl border-t border-border pt-8">
            <SpendingTrendChart transactions={transactions} />
          </div>
        </section>
      )}

      {transactions.length > 0 && (
        <section className="border-b border-border pb-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ledger</p>
              <h2 className="mt-1 text-lg font-semibold">Recent transactions</h2>
            </div>
            <p className="text-xs text-muted-foreground">{transactionCount} entries</p>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
            ) : (
              <div>
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between gap-4 border-t border-border/70 py-4 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="truncate text-sm font-medium">
                          {txn.merchant_name || txn.description || 'Transaction'}
                        </span>
                        <span className="shrink-0 text-xs capitalize text-muted-foreground">{txn.category.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(txn.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">
                        &#8377;{Number(txn.amount).toLocaleString('en-IN')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTransaction(txn.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
