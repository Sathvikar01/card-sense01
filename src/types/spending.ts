// Type definitions for spending transactions

export type SpendingCategory =
  | 'dining'
  | 'groceries'
  | 'travel'
  | 'fuel'
  | 'shopping'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'education'
  | 'bills'
  | 'other'

export interface SpendingTransaction {
  id: string
  user_id: string
  amount: number
  category: SpendingCategory
  merchant: string | null
  card_used: string | null
  transaction_date: string
  source: 'manual' | 'bank-statement'
  notes: string | null
  created_at: string
}

export interface SpendingSummary {
  total: number
  by_category: Record<SpendingCategory, number>
  by_month: Record<string, number>
}

export interface CategorySpending {
  category: SpendingCategory
  amount: number
  percentage: number
  transaction_count: number
}
