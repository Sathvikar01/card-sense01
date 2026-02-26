import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CreditScoreRange =
  | 'no_history'
  | 'below_600'
  | '600_649'
  | '650_699'
  | '700_749'
  | '750_799'
  | '800_plus'

export type PaymentBehavior = 'full_always' | 'full_mostly' | 'minimum_often' | 'carry_balance'

export type AprTolerance = 'below_18' | '18_to_24' | '24_to_36' | 'doesnt_matter'

export type AnnualFeeTolerance = 'zero' | 'under_500' | 'under_2000' | 'under_5000' | 'any_if_worth'

export type PrimaryGoal =
  | 'rewards_cashback'
  | 'low_interest'
  | 'credit_building'
  | 'travel_perks'
  | 'fuel_savings'
  | 'online_shopping'
  | 'premium_lifestyle'
  | 'debt_management'

export type CardComplexity = 'one_simple' | 'few_optimized' | 'dont_mind_complex'

export type DisciplineLevel = 'very_disciplined' | 'mostly_on_time' | 'sometimes_late' | 'need_help'

export type UserPersona =
  | 'student_firsttime'
  | 'salaried_everyday'
  | 'rewards_maximizer'
  | 'frequent_traveller'
  | 'online_shopper'
  | 'self_employed'
  | 'credit_builder'

export type EmploymentType =
  | 'salaried'
  | 'self_employed'
  | 'business_owner'
  | 'freelancer'
  | 'student'
  | 'retired'
  | 'homemaker'

export interface SpendingEntry {
  category: string
  amount: number
}

/* ------------------------------------------------------------------ */
/*  Store shape                                                        */
/* ------------------------------------------------------------------ */

export interface AdvisorFormState {
  // Phase 0: Basics
  creditScore: CreditScoreRange
  employmentType: EmploymentType
  monthlyIncome: number
  age: number
  city: string
  primaryBank: string

  // Phase 1: Financial Habits
  paymentBehavior: PaymentBehavior
  aprTolerance: AprTolerance
  annualFeeTolerance: AnnualFeeTolerance
  disciplineLevel: DisciplineLevel
  interestedInIntroOffers: boolean

  // Phase 2: Spending Profile
  topSpendingCategories: string[]
  spendingAmounts: Record<string, number>
  usesCardAbroad: boolean
  monthlySpendEstimate: number
  desiredCreditLimit: number

  // Phase 3: Goals
  primaryGoal: PrimaryGoal
  secondaryGoals: string[]
  cardComplexity: CardComplexity

  // Phase 4: Persona-specific
  detectedPersona: UserPersona | null
  existingCards: string[]
  hasEmergencyFund: boolean
  hasFD: boolean
  fdAmount: number
  preferredRewardType: string
  travelFrequency: string
  preferredAirlines: string[]
  preferredPlatforms: string[]
  wantsSeparateBusinessCard: boolean
  businessExpenseCategories: string[]
  debtReductionPrimary: boolean
  willingSecuredCard: boolean
  upgradePathImportant: boolean

  // Meta
  currentStep: number
  completedSteps: number[]
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const initialState: AdvisorFormState = {
  creditScore: '700_749',
  employmentType: 'salaried',
  monthlyIncome: 50000,
  age: 28,
  city: '',
  primaryBank: '',

  paymentBehavior: 'full_always',
  aprTolerance: 'doesnt_matter',
  annualFeeTolerance: 'under_2000',
  disciplineLevel: 'very_disciplined',
  interestedInIntroOffers: false,

  topSpendingCategories: [],
  spendingAmounts: {},
  usesCardAbroad: false,
  monthlySpendEstimate: 30000,
  desiredCreditLimit: 100000,

  primaryGoal: 'rewards_cashback',
  secondaryGoals: [],
  cardComplexity: 'one_simple',

  detectedPersona: null,
  existingCards: [],
  hasEmergencyFund: true,
  hasFD: false,
  fdAmount: 0,
  preferredRewardType: 'cashback',
  travelFrequency: 'rarely',
  preferredAirlines: [],
  preferredPlatforms: [],
  wantsSeparateBusinessCard: false,
  businessExpenseCategories: [],
  debtReductionPrimary: false,
  willingSecuredCard: false,
  upgradePathImportant: false,

  currentStep: 0,
  completedSteps: [],
}

/* ------------------------------------------------------------------ */
/*  Helper: bucket a numeric CIBIL score into a CreditScoreRange      */
/* ------------------------------------------------------------------ */

export function bucketCibilScore(score: number | null | undefined): CreditScoreRange {
  if (!score || score === 0) return 'no_history'
  if (score < 600) return 'below_600'
  if (score < 650) return '600_649'
  if (score < 700) return '650_699'
  if (score < 750) return '700_749'
  if (score < 800) return '750_799'
  return '800_plus'
}

/* ------------------------------------------------------------------ */
/*  Persona detection                                                  */
/* ------------------------------------------------------------------ */

export function detectPersona(state: AdvisorFormState): UserPersona {
  const { employmentType, primaryGoal, monthlyIncome, creditScore, age, topSpendingCategories } = state

  // Student / first-timer
  if (employmentType === 'student' || (age <= 23 && creditScore === 'no_history')) {
    return 'student_firsttime'
  }

  // Credit builder / rebuilder
  if (
    primaryGoal === 'credit_building' ||
    primaryGoal === 'debt_management' ||
    creditScore === 'below_600' ||
    creditScore === 'no_history'
  ) {
    return 'credit_builder'
  }

  // Self-employed / business
  if (
    employmentType === 'self_employed' ||
    employmentType === 'business_owner' ||
    employmentType === 'freelancer'
  ) {
    return 'self_employed'
  }

  // Frequent traveller
  if (
    primaryGoal === 'travel_perks' ||
    topSpendingCategories.includes('travel')
  ) {
    return 'frequent_traveller'
  }

  // Online shopper
  if (
    primaryGoal === 'online_shopping' ||
    topSpendingCategories.includes('online_shopping')
  ) {
    return 'online_shopper'
  }

  // Rewards maximizer / high spender
  if (
    primaryGoal === 'premium_lifestyle' ||
    monthlyIncome >= 150000 ||
    (primaryGoal === 'rewards_cashback' && monthlyIncome >= 80000)
  ) {
    return 'rewards_maximizer'
  }

  // Default: salaried everyday
  return 'salaried_everyday'
}

/* ------------------------------------------------------------------ */
/*  Saved recommendation types (shared with advisor-results)          */
/* ------------------------------------------------------------------ */

export interface SavedAdvisorCard {
  id: string
  name: string
  bank: string
  score: number
  reason: string
  annualFee: number
  rewardRate: number
  estimatedAnnualValue: number
  pros: string[]
  cons: string[]
  bestCategories: string[]
  eligibilityMatch: 'high' | 'moderate' | 'uncertain'
  usageStrategy: string
}

export interface ProfileSummaryData {
  monthlyIncome?: number
  creditScore?: string
  persona?: string
  primaryGoal?: string
  topSpending?: string[]
  age?: number
  employment?: string
}

export interface SavedAdvisorResult {
  cards: SavedAdvisorCard[]
  analysis: string
  persona: UserPersona | null
  profileSummary: string | ProfileSummaryData
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export interface ProfilePrefillData {
  creditScore?: number | null
  employmentType?: string | null
  annualIncome?: number | null
  city?: string | null
  primaryBank?: string | null
  hasFD?: boolean | null
  fdAmount?: number | null
  existingCards?: string[] | null
}

export interface SpendingPrefillData {
  byCategory?: Record<string, number> | null
}

interface AdvisorStore extends AdvisorFormState {
  savedResult: SavedAdvisorResult | null
  profilePrefilledFields: string[]
  setSavedResult: (result: SavedAdvisorResult | null) => void
  setStep: (step: number) => void
  markStepComplete: (step: number) => void
  updateField: <K extends keyof AdvisorFormState>(field: K, value: AdvisorFormState[K]) => void
  updateSpendingAmount: (category: string, amount: number) => void
  toggleSpendingCategory: (category: string) => void
  toggleSecondaryGoal: (goal: string) => void
  runPersonaDetection: () => void
  reset: () => void
  getTotalMonthlySpend: () => number
  getApiPayload: () => Record<string, unknown>
  prefillFromProfile: (data: ProfilePrefillData) => void
  prefillFromSpending: (data: SpendingPrefillData) => void
}

const SPENDING_CATEGORY_MAP: Record<string, string> = {
  shopping: 'online_shopping',
  bills: 'utilities',
  insurance: 'utilities',
  emi: 'rent',
}

const ADVISOR_SPENDING_CATEGORIES = new Set([
  'groceries',
  'fuel',
  'dining',
  'travel',
  'online_shopping',
  'utilities',
  'rent',
  'entertainment',
  'healthcare',
  'education',
])

export const useAdvisorStore = create<AdvisorStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      savedResult: null as SavedAdvisorResult | null,
      profilePrefilledFields: [] as string[],

      setSavedResult: (result: SavedAdvisorResult | null) => set({ savedResult: result }),

      setStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((s) => ({
          completedSteps: s.completedSteps.includes(step)
            ? s.completedSteps
            : [...s.completedSteps, step],
        })),

      updateField: (field, value) => set({ [field]: value }),

      updateSpendingAmount: (category, amount) =>
        set((s) => ({
          spendingAmounts: { ...s.spendingAmounts, [category]: amount },
        })),

      toggleSpendingCategory: (category) =>
        set((s) => {
          const current = s.topSpendingCategories
          const next = current.includes(category)
            ? current.filter((c) => c !== category)
            : current.length < 5
              ? [...current, category]
              : current
          return { topSpendingCategories: next }
        }),

      toggleSecondaryGoal: (goal) =>
        set((s) => {
          const current = s.secondaryGoals
          const next = current.includes(goal)
            ? current.filter((g) => g !== goal)
            : [...current, goal]
          return { secondaryGoals: next }
        }),

      runPersonaDetection: () => {
        const persona = detectPersona(get())
        set({ detectedPersona: persona })
      },

      reset: () => set({ ...initialState, savedResult: null, profilePrefilledFields: [] }),

      prefillFromProfile: (data: ProfilePrefillData) => {
        const filled: string[] = []
        const updates: Partial<AdvisorFormState> = {}

        if (data.creditScore !== undefined && data.creditScore !== null) {
          updates.creditScore = bucketCibilScore(data.creditScore)
          filled.push('creditScore')
        }
        if (data.employmentType) {
          updates.employmentType = data.employmentType as EmploymentType
          filled.push('employmentType')
        }
        if (data.annualIncome !== undefined && data.annualIncome !== null && data.annualIncome > 0) {
          updates.monthlyIncome = Math.round(data.annualIncome / 12)
          filled.push('monthlyIncome')
        }
        if (data.city) {
          updates.city = data.city
          filled.push('city')
        }
        if (data.primaryBank) {
          updates.primaryBank = data.primaryBank
          filled.push('primaryBank')
        }
        if (data.hasFD !== undefined && data.hasFD !== null) {
          updates.hasFD = data.hasFD
          filled.push('hasFD')
        }
        if (data.fdAmount !== undefined && data.fdAmount !== null && data.fdAmount > 0) {
          updates.fdAmount = data.fdAmount
          filled.push('fdAmount')
        }
        if (Array.isArray(data.existingCards) && data.existingCards.length > 0) {
          updates.existingCards = data.existingCards
          filled.push('existingCards')
        }

        set({ ...updates, profilePrefilledFields: filled })
      },

      prefillFromSpending: (data: SpendingPrefillData) => {
        const byCategory = data.byCategory || {}
        const normalizedEntries = Object.entries(byCategory)
          .map(([category, rawAmount]) => {
            const mappedCategory = SPENDING_CATEGORY_MAP[category] || category
            const amount = Number(rawAmount)
            if (!ADVISOR_SPENDING_CATEGORIES.has(mappedCategory) || !Number.isFinite(amount) || amount <= 0) {
              return null
            }
            return [mappedCategory, Math.round(amount)] as const
          })
          .filter((entry): entry is readonly [string, number] => entry !== null)

        if (normalizedEntries.length === 0) {
          return
        }

        set((state) => {
          const hasExistingSpend = Object.values(state.spendingAmounts).some((amount) => amount > 0)
          const mergedSpending: Record<string, number> = {}
          for (const [category, amount] of normalizedEntries) {
            mergedSpending[category] = (mergedSpending[category] || 0) + amount
          }

          const nextSpendingAmounts = hasExistingSpend ? state.spendingAmounts : mergedSpending
          const rankedCategories = Object.entries(nextSpendingAmounts)
            .filter(([, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([category]) => category)
            .slice(0, 5)
          const nextTopCategories =
            state.topSpendingCategories.length > 0 ? state.topSpendingCategories : rankedCategories
          const monthlySpendEstimate = Object.values(nextSpendingAmounts).reduce(
            (sum, amount) => sum + amount,
            0
          )
          const nextPrefilledFields = Array.from(
            new Set([...state.profilePrefilledFields, 'topSpendingCategories', 'spendingAmounts'])
          )

          return {
            spendingAmounts: nextSpendingAmounts,
            topSpendingCategories: nextTopCategories,
            monthlySpendEstimate:
              monthlySpendEstimate > 0 ? monthlySpendEstimate : state.monthlySpendEstimate,
            profilePrefilledFields: nextPrefilledFields,
          }
        })
      },

      getTotalMonthlySpend: () => {
        const amounts = get().spendingAmounts
        return Object.values(amounts).reduce((sum, val) => sum + val, 0)
      },

      getApiPayload: () => {
        const s = get()
        const scoreMap: Record<CreditScoreRange, number> = {
          no_history: 0,
          below_600: 550,
          '600_649': 625,
          '650_699': 675,
          '700_749': 725,
          '750_799': 775,
          '800_plus': 850,
        }
        return {
          cibilScore: scoreMap[s.creditScore],
          age: s.age,
          city: s.city,
          primaryBank: s.primaryBank,
          employmentType: s.employmentType,
          monthlyIncome: s.monthlyIncome,
          annualIncome: s.monthlyIncome * 12,
          paymentBehavior: s.paymentBehavior,
          aprTolerance: s.aprTolerance,
          annualFeeTolerance: s.annualFeeTolerance,
          disciplineLevel: s.disciplineLevel,
          interestedInIntroOffers: s.interestedInIntroOffers,
          topSpendingCategories: s.topSpendingCategories,
          spendingBreakdown: s.spendingAmounts,
          monthlySpending: s.getTotalMonthlySpend(),
          usesCardAbroad: s.usesCardAbroad,
          desiredCreditLimit: s.desiredCreditLimit,
          primaryGoal: s.primaryGoal,
          secondaryGoals: s.secondaryGoals,
          creditGoals: [s.primaryGoal, ...s.secondaryGoals],
          cardComplexity: s.cardComplexity,
          detectedPersona: s.detectedPersona,
          existingCards: s.existingCards,
          hasFixedDeposits: s.hasFD,
          fdAmount: s.fdAmount,
          hasEmergencyFund: s.hasEmergencyFund,
          preferredRewardType: s.preferredRewardType,
          travelFrequency: s.travelFrequency,
          preferredPlatforms: s.preferredPlatforms,
          wantsSeparateBusinessCard: s.wantsSeparateBusinessCard,
          businessExpenseCategories: s.businessExpenseCategories,
          debtReductionPrimary: s.debtReductionPrimary,
          willingSecuredCard: s.willingSecuredCard,
          upgradePathImportant: s.upgradePathImportant,
        }
      },
    }),
    {
      name: 'cardsense-advisor-storage',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { currentStep, completedSteps, ...rest } = state
        return rest
      },
    }
  )
)
