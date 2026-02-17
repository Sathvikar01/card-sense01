'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, CreditCard, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
  id: string
  amount: number
  category: string
  merchant_name: string | null
  transaction_date: string
  description: string | null
}

export default function SpendingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalSpend, setTotalSpend] = useState(0)
  const [transactionCount, setTransactionCount] = useState(0)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/spending')
      const data = await response.json()
      
      if (response.ok) {
        setTransactions(data.transactions || [])
        setTotalSpend(data.aggregates?.total || 0)
        setTransactionCount(data.aggregates?.count || 0)
      } else {
        toast.error('Failed to load transactions')
      }
    } catch {
      toast.error('Error loading transactions')
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/spending?id=${id}`, {
        method: 'DELETE'
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
          <h1 className="text-3xl font-bold text-gray-900">Spending Tracker</h1>
          <p className="text-gray-600 mt-1">Track and optimize your credit card spending</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpend.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionCount}</div>
            <p className="text-xs text-gray-500">Total entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Transaction</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{transactionCount > 0 ? Math.round(totalSpend / transactionCount).toLocaleString('en-IN') : 0}
            </div>
            <p className="text-xs text-gray-500">Average amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No transactions yet</p>
              <p className="text-xs mt-1">Add your first transaction to start tracking</p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{txn.merchant_name || 'Transaction'}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {txn.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(txn.transaction_date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">₹{Number(txn.amount).toLocaleString('en-IN')}</span>
                    <Button
                      variant="ghost"
                      size="sm"
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

      {/* Charts Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
