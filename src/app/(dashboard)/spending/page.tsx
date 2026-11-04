'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { toast } from 'sonner'
import { CategoryList, toCategoryShares } from '@/components/dashboard/category-breakdown'
import { Section } from '@/components/shared/section'

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
      <PageHeader title="Spending" className={transactions.length > 0 ? 'mb-2' : undefined}>
        {!loading && transactions.length > 0 && (
          <Button variant={showEntry ? 'ghost' : 'default'} onClick={() => setShowEntry(!showEntry)}>
            {showEntry ? 'Cancel' : 'Add'}
          </Button>
        )}
      </PageHeader>

      {!loading && (
        <div className="space-y-10">
          {transactions.length > 0 && <p className="text-muted-foreground">{formatInr(totalSpend)} logged</p>}

          {showEntry && (
            <Section title="A typical month">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleSaveSpending()
                }}
              >
                {SPENDING_CATEGORIES.map((cat) => (
                  <label key={cat.key} htmlFor={`spend-${cat.key}`} className="row py-1.5">
                    <span className="flex-1 text-sm">{cat.label}</span>
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
                <div className="flex items-center justify-between gap-4 pt-5">
                  <p className="text-xl font-semibold tabular-nums">{formatInr(entryTotal)}</p>
                  <Button type="submit" disabled={saving || entryTotal === 0}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </form>
            </Section>
          )}

          {transactions.length > 0 && (
            <>
              <Section title="By category">
                <CategoryList data={toCategoryShares(transactions)} />
              </Section>

              <Section title="Entries">
                <ul>
                  {transactions.map((txn) => (
                    <li key={txn.id} className="row group py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{txn.merchant_name || txn.description || txn.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-sm tabular-nums">{formatInr(Number(txn.amount))}</span>
                      <button
                        type="button"
                        onClick={() => deleteTransaction(txn.id)}
                        aria-label={`Remove ${txn.merchant_name || 'entry'}`}
                        className="text-sm text-muted-foreground transition-[color,opacity] hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </Section>
            </>
          )}
        </div>
      )}
    </div>
  )
}
