'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { toast } from 'sonner'
import { CategoryBreakdown, toCategoryShares } from '@/components/dashboard/category-breakdown'
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
  { key: 'groceries', label: 'Groceries' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'dining', label: 'Dining' },
  { key: 'travel', label: 'Travel' },
  { key: 'shopping', label: 'Online shopping' },
  { key: 'utilities', label: 'Bills' },
  { key: 'rent', label: 'Rent and EMI' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'education', label: 'Education' },
  { key: 'other', label: 'Other' },
] as const

export default function SpendingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSpend, setTotalSpend] = useState(0)
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
        if (txns.length === 0) setShowEntry(true)
      } else {
        setTransactions([])
        setTotalSpend(0)
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
        fetchTransactions()
      } else {
        toast.error('Could not delete')
      }
    } catch {
      toast.error('Could not delete')
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
      toast.error('Enter an amount')
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
        toast.success('Saved')
        setAmounts({})
        setShowEntry(false)
        fetchTransactions()
      } else {
        toast.error('Could not save. Try again.')
      }
    } catch {
      toast.error('Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const entryTotal = Object.values(amounts).reduce((sum, val) => sum + (Number(val) || 0), 0)

  const formatInr = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`

  return (
    <div>
      <PageHeader title="Spending">
        {!loading && transactions.length > 0 && (
          <Button variant={showEntry ? 'ghost' : 'default'} onClick={() => setShowEntry(!showEntry)}>
            {showEntry ? 'Cancel' : 'Add'}
          </Button>
        )}
      </PageHeader>

      {!loading && (
        <div className="space-y-10">
          {showEntry && (
            <form
              className="surface"
              onSubmit={(e) => {
                e.preventDefault()
                void handleSaveSpending()
              }}
            >
              <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
                {SPENDING_CATEGORIES.map((cat) => (
                  <label
                    key={cat.key}
                    htmlFor={`spend-${cat.key}`}
                    className="flex items-center justify-between gap-4 px-5 py-2.5 sm:border-b sm:border-border sm:odd:border-r"
                  >
                    <span className="text-sm">{cat.label}</span>
                    <span className="relative w-32">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                      <Input
                        id={`spend-${cat.key}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={100}
                        placeholder="0"
                        value={amounts[cat.key] ?? ''}
                        onChange={(e) => setAmounts((prev) => ({ ...prev, [cat.key]: e.target.value }))}
                        className="h-9 pl-7 text-right tabular-nums"
                      />
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <p className="text-sm">
                  <span className="text-muted-foreground">Per month </span>
                  <span className="font-semibold tabular-nums">{formatInr(entryTotal)}</span>
                </p>
                <Button type="submit" disabled={saving || entryTotal === 0}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          )}

          {transactions.length > 0 && (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight">{formatInr(totalSpend)}</p>
              </div>

              <div className="grid gap-10 lg:grid-cols-2">
                <CategoryBreakdown data={toCategoryShares(transactions)} />
                <SpendingTrendChart transactions={transactions} />
              </div>

              <section>
                <h2 className="mb-3 text-base font-semibold">Transactions</h2>
                <ul className="surface divide-y divide-border">
                  {transactions.map((txn) => (
                    <li key={txn.id} className="group flex items-center gap-4 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{txn.merchant_name || txn.description || txn.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{formatInr(Number(txn.amount))}</span>
                      <button
                        type="button"
                        onClick={() => deleteTransaction(txn.id)}
                        aria-label={`Delete ${txn.merchant_name || 'transaction'}`}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}
