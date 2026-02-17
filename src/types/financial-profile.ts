// Type definitions for user financial profile

export interface FinancialProfile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  city: string | null
  income_range: string | null
  employment_type: string | null
  primary_bank: string | null
  cibil_score: number | null
  existing_cards: ExistingCard[]
  fixed_deposits: FixedDeposit[]
  created_at: string
  updated_at: string
}

export interface ExistingCard {
  card_id?: string
  card_name: string
  bank: string
  limit?: number
}

export interface FixedDeposit {
  bank: string
  amount: number
  maturity_date?: string
}

export type IncomeRange =
  | 'Below 3 Lakhs'
  | '3-5 Lakhs'
  | '5-10 Lakhs'
  | '10-15 Lakhs'
  | '15-25 Lakhs'
  | 'Above 25 Lakhs'

export type EmploymentType =
  | 'Salaried'
  | 'Self-Employed'
  | 'Business Owner'
  | 'Professional'
  | 'Student'
  | 'Retired'

export interface BeginnerQuestionnaireData {
  // Step 1: Personal
  full_name: string
  city: string
  age_group: string

  // Step 2: Income & Employment
  employment_type: EmploymentType
  income_range: IncomeRange

  // Step 3: Banking
  primary_bank: string
  has_savings_account: boolean
  has_salary_account: boolean

  // Step 4: Spending Habits
  monthly_spending: number
  top_spending_categories: string[]

  // Step 5: Goals
  credit_card_goals: string[]
  preferred_rewards: string[]
}

export interface ExperiencedUserData {
  cibil_score: number
  income_range: IncomeRange
  employment_type: EmploymentType
  existing_cards: ExistingCard[]
  fixed_deposits: FixedDeposit[]
  monthly_spending: number
  spending_categories: Record<string, number>
  goals: string[]
}

// ============================================================================
// AI-Ready Input Interfaces (for Gemini API)
// ============================================================================

// Beginner user input (questionnaire)
export interface BeginnerInput {
  // Personal info
  age: number
  city: string

  // Employment
  employmentType: 'salaried' | 'self_employed' | 'student' | 'unemployed' | 'retired'
  monthlyIncome: number // in INR

  // Banking
  primaryBank: string
  hasBankAccount: boolean
  accountAge?: number // months

  // Spending
  averageMonthlySpend: number // in INR
  primarySpendCategories: string[] // e.g., ['groceries', 'dining', 'online_shopping']

  // Goals
  creditGoals: string[] // e.g., ['build_credit', 'rewards', 'travel', 'cashback']
  preferredCardType?: 'cashback' | 'rewards' | 'travel' | 'lifestyle' | 'fuel'
}

// Experienced user input (detailed profile)
export interface ExperiencedInput {
  // Credit profile
  cibilScore: number // 300-900
  creditAge?: number // months with credit
  existingCards?: string[] // array of card IDs

  // Income & assets
  monthlyIncome: number // in INR
  annualIncome: number // in INR
  hasFixedDeposits: boolean
  fdAmount?: number // in INR

  // Banking
  primaryBank: string
  relationshipYears?: number

  // Spending profile
  monthlySpending: number // in INR
  spendingBreakdown: SpendingBreakdown

  // Parsed statement data (optional)
  parsedStatement?: ParsedStatement

  // Goals
  creditGoals: string[]
  preferredRewardType?: 'cashback' | 'points' | 'airline_miles' | 'hotel_points'
  annualFeePreference?: 'free' | 'low' | 'premium' | 'no_preference'
}

// Spending breakdown by category
export interface SpendingBreakdown {
  groceries: number
  dining: number
  online_shopping: number
  fuel: number
  utilities: number
  entertainment: number
  travel: number
  healthcare: number
  education: number
  other: number
}

// Parsed bank statement
export interface ParsedStatement {
  bankName: string
  accountNumber?: string
  statementPeriod: {
    startDate: string // ISO date
    endDate: string // ISO date
  }
  totalTransactions: number
  totalSpending: number // in INR
  transactions: ParsedTransaction[]
  categoryBreakdown: SpendingBreakdown
}

// Individual transaction from parsed statement
export interface ParsedTransaction {
  date: string // ISO date
  description: string
  merchant?: string
  amount: number // in INR
  category: string
  transactionType: 'debit' | 'credit'
}
