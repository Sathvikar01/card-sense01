'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, CreditCard, Calendar, Plus, Save } from 'lucide-react'
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

const CATEGORY_COLORS: Record<string, string> = {
  dining: 'bg-orange-100 text-orange-800',
  shopping: 'bg-pink-100 text-pink-800',
  travel: 'bg-blue-100 text-blue-800',
  groceries: 'bg-green-100 text-green-800',
  entertainment: 'bg-purple-100 text-purple-800',
  fuel: 'bg-amber-100 text-amber-800',
  utilities: 'bg-cyan-100 text-cyan-800',
  rent: 'bg-violet-100 text-violet-800',
  healthcare: 'bg-red-100 text-red-800',
  education: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
}

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Spending Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your monthly category-wise spending
          </p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-lg shadow-[#b8860b]/20"
          onClick={() => setShowEntry(!showEntry)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Spending</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {showEntry && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017] text-white">
                <Plus className="h-3.5 w-3.5" />
              </div>
              Enter Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Enter approximate monthly spending for each category. Leave blank for categories you don&apos;t use.
            </p>

            {/* Category grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPENDING_CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-center gap-3 rounded-xl border border-border/60 p-3 bg-muted/10">
                  <span className="text-muted-foreground shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <label htmlFor={`spend-${cat.key}`} className="text-sm font-medium text-foreground cursor-pointer">
                      {cat.label}
                    </label>
                  </div>
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium select-none">&#8377;</span>
                    <Input
                      id={`spend-${cat.key}`}
                      type="number"
                      min={0}
                      step={100}
                      placeholder="0"
                      value={amounts[cat.key] ?? ''}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [cat.key]: e.target.value }))}
                      className="pl-7 h-9 rounded-lg text-sm tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total + Save */}
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Total</p>
                <p className="text-xs text-muted-foreground">Combined monthly spending</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-primary">
                &#8377;{entryTotal.toLocaleString('en-IN')}
              </p>
            </div>

            <Button
              onClick={handleSaveSpending}
              disabled={saving || entryTotal === 0}
              className="w-full gap-2 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-lg shadow-[#b8860b]/20"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Spending'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#d4a017]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&#8377;{totalSpend.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-[#d4a017]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionCount}</div>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
            <Calendar className="h-4 w-4 text-[#d4a017]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377;{transactionCount > 0 ? Math.round(totalSpend / transactionCount).toLocaleString('en-IN') : 0}
            </div>
            <p className="text-xs text-muted-foreground">Average amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {transactions.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <SpendingCategoryChart transactions={transactions} />
          <SpendingTrendChart transactions={transactions} />
        </div>
      )}

      {/* Transactions list */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {txn.merchant_name || txn.description || 'Transaction'}
                        </span>
                        <span
                          className={`text-[0.65rem] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            CATEGORY_COLORS[txn.category] || CATEGORY_COLORS.other
                          }`}
                        >
                          {txn.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(txn.transaction_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
