'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, CreditCard, Calendar, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { StatementUploadZone } from '@/components/spending/statement-upload-zone'

interface Transaction {
  id: string
  amount: number
  category: string
  merchant_name: string | null
  transaction_date: string
  description: string | null
}

const CATEGORY_COLORS: Record<string, string> = {
  dining: 'bg-orange-100 text-orange-800',
  shopping: 'bg-pink-100 text-pink-800',
  travel: 'bg-blue-100 text-blue-800',
  groceries: 'bg-green-100 text-green-800',
  entertainment: 'bg-purple-100 text-purple-800',
  fuel: 'bg-amber-100 text-amber-800',
  utilities: 'bg-cyan-100 text-cyan-800',
  healthcare: 'bg-red-100 text-red-800',
  education: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
}

export default function SpendingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSpend, setTotalSpend] = useState(0)
  const [transactionCount, setTransactionCount] = useState(0)
  const [showUpload, setShowUpload] = useState(false)

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
        // Auto-show upload zone when there are no transactions
        if (txns.length === 0) setShowUpload(true)
      } else {
        // Gracefully handle errors (table may not exist yet)
        setTransactions([])
        setTotalSpend(0)
        setTransactionCount(0)
        setShowUpload(true)
      }
    } catch {
      // Network error - show empty state
      setTransactions([])
      setShowUpload(true)
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/spending?id=${id}`, {
        method: 'DELETE',
      })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Spending Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload bank statements to track your credit card spending
          </p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white shadow-lg shadow-[#b8860b]/20"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload Statement</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>

      {/* Upload Zone */}
      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017]">
                <Upload className="h-3.5 w-3.5 text-white" />
              </div>
              Upload Bank Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatementUploadZone
              onUploadComplete={() => {
                fetchTransactions()
                setShowUpload(false)
              }}
            />
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
            <div className="text-2xl font-bold">₹{totalSpend.toLocaleString('en-IN')}</div>
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
              ₹{transactionCount > 0 ? Math.round(totalSpend / transactionCount).toLocaleString('en-IN') : 0}
            </div>
            <p className="text-xs text-muted-foreground">Average amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
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
                          {txn.category}
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
                        ₹{Number(txn.amount).toLocaleString('en-IN')}
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
