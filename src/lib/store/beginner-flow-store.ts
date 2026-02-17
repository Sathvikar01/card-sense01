// Zustand store for beginner questionnaire flow state management

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BeginnerInput, SpendingBreakdown } from '@/types/financial-profile'

// Extended beginner form state with all questionnaire fields
export interface BeginnerFormState {
  // Step 1: Personal Info
  age: number
  city: string

  // Step 2: Income
  employmentType: 'salaried' | 'self_employed' | 'business' | 'student' | 'freelancer'
  monthlyIncome: number
  annualIncome: number

  // Step 3: Banking
  primaryBank: string
  hasSavingsAccount: boolean
  hasFD: boolean
  fdAmount?: number

  // Step 4: Spending
  spending: SpendingBreakdown

  // Step 5: Goals
  goals: string[]

  // Flow control
  currentStep: number
}

interface BeginnerFlowStore extends BeginnerFormState {
  // Actions
  setStep: (step: number) => void
  updateField: <K extends keyof BeginnerFormState>(field: K, value: BeginnerFormState[K]) => void
  updateSpending: (category: keyof SpendingBreakdown, value: number) => void
  reset: () => void

  // Computed values
  getTotalMonthlySpend: () => number

  // Convert to API format
  toBeginnerInput: () => BeginnerInput
}

// Initial state
const initialState: BeginnerFormState = {
  age: 25,
  city: '',
  employmentType: 'salaried',
  monthlyIncome: 30000,
  annualIncome: 360000,
  primaryBank: '',
  hasSavingsAccount: true,
  hasFD: false,
  fdAmount: undefined,
  spending: {
    groceries: 5000,
    dining: 3000,
    online_shopping: 4000,
    fuel: 2000,
    utilities: 2000,
    entertainment: 2000,
    travel: 3000,
    healthcare: 1000,
    education: 0,
    other: 1000,
  },
  goals: [],
  currentStep: 0,
}

export const useBeginnerFlowStore = create<BeginnerFlowStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => {
        set({ currentStep: step })
      },

      updateField: (field, value) => {
        set({ [field]: value })

        // Auto-calculate annual income when monthly income changes
        if (field === 'monthlyIncome') {
          set({ annualIncome: (value as number) * 12 })
        }
      },

      updateSpending: (category, value) => {
        set((state) => ({
          spending: {
            ...state.spending,
            [category]: value,
          },
        }))
      },

      reset: () => {
        set(initialState)
      },

      getTotalMonthlySpend: () => {
        const spending = get().spending
        return Object.values(spending).reduce((sum, val) => sum + val, 0)
      },

      toBeginnerInput: () => {
        const state = get()
        const totalSpend = state.getTotalMonthlySpend()
        const mapEmploymentType = () => {
          if (state.employmentType === 'business' || state.employmentType === 'freelancer') {
            return 'self_employed' as const
          }
          if (state.employmentType === 'student') {
            return 'student' as const
          }
          return state.employmentType as 'salaried' | 'self_employed'
        }

        // Map spending categories to primary spend categories for AI
        const primarySpendCategories: string[] = []
        const spendingEntries = Object.entries(state.spending).map(([key, value]) => ({
          category: key,
          amount: value,
        }))

        // Sort by amount and take top 3
        spendingEntries
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3)
          .forEach((entry) => {
            if (entry.amount > 0) {
              primarySpendCategories.push(entry.category)
            }
          })

        return {
          age: state.age,
          city: state.city,
          employmentType: mapEmploymentType(),
          monthlyIncome: state.monthlyIncome,
          primaryBank: state.primaryBank,
          hasBankAccount: state.hasSavingsAccount,
          accountAge: state.hasSavingsAccount ? 12 : undefined, // Assume 1 year if has account
          averageMonthlySpend: totalSpend,
          primarySpendCategories,
          creditGoals: state.goals,
        }
      },
    }),
    {
      name: 'beginner-flow-storage',
      // Optional: customize what gets persisted
      partialize: (state) => ({
        age: state.age,
        city: state.city,
        employmentType: state.employmentType,
        monthlyIncome: state.monthlyIncome,
        annualIncome: state.annualIncome,
        primaryBank: state.primaryBank,
        hasSavingsAccount: state.hasSavingsAccount,
        hasFD: state.hasFD,
        fdAmount: state.fdAmount,
        spending: state.spending,
        goals: state.goals,
        currentStep: state.currentStep,
      }),
    }
  )
)
