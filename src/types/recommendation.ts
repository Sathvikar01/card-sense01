// Type definitions for AI recommendations

export interface CardRecommendation {
  cardId: string
  cardName: string
  bank: string
  score: number // 0-100 match score
  reasoning: string
  keyPerks?: string[]
  benefitSummary?: string[]
  rewardBreakdown?: RewardBreakdown
  annualValue?: number // Net annual value (rewards - fees)
  rank: number
}

export interface RewardBreakdown {
  estimatedAnnualRewards: number
  categoryBreakdown: {
    category: string
    monthlySpend: number
    rewardRate: number
    monthlyRewards: number
    annualRewards: number
  }[]
  fees: {
    joining: number
    annual: number
    total: number
  }
  netValue: number
}

export type RecommendationSnapshot = Record<string, unknown>

export interface Recommendation {
  id: string
  user_id: string
  recommendation_type: 'beginner' | 'experienced' | 'chat'
  input_snapshot: RecommendationSnapshot
  recommended_cards: CardRecommendation[]
  ai_analysis: string | null
  spending_analysis: RecommendationSnapshot | null
  created_at: string
}

export interface BeginnerRecommendationResponse {
  recommendations: CardRecommendation[]
  application_guide: {
    steps: string[]
    documents_needed: string[]
    tips: string[]
  }
  credit_education: {
    topics: string[]
    tips: string[]
  }
}

export interface ExperiencedRecommendationResponse {
  recommendations: CardRecommendation[]
  portfolio_strategy: string
  reward_optimization: {
    currentCards: string[]
    recommendedUsage: Record<string, string[]>
    potentialAnnualSavings: number
  }
  spending_insights: {
    topCategories: string[]
    opportunities: string[]
  }
}

// ============================================================================
// Enhanced AI Recommendation Interfaces (for Gemini API)
// ============================================================================

// AI-generated recommendation response
export interface AIRecommendation {
  // Metadata
  userId: string
  createdAt: string // ISO date
  recommendationType: 'beginner' | 'experienced'

  // Input snapshot (for history)
  inputData: RecommendationSnapshot

  // Recommended cards
  recommendedCards: RecommendedCard[]

  // AI analysis
  analysis: {
    summary: string // Overall recommendation summary
    profileAnalysis: string // Analysis of user's financial profile
    strategyAdvice: string // Portfolio strategy or usage advice
    creditEducation?: string // For beginners - Credit 101 tips
  }

  // Application guidance (for beginners)
  applicationGuide?: {
    steps: string[] // Step-by-step application process
    documentsNeeded: string[] // Required documents
    tips: string[] // Application tips
    expectedTimeline: string // Processing time
  }
}

// Individual recommended card with analysis
export interface RecommendedCard {
  // Card reference
  cardId: string
  cardName: string
  bankName: string

  // Recommendation rank
  rank: number // 1-5

  // AI reasoning
  reasoning: string // Why this card is recommended
  bestFor: string[] // Best use cases

  // Value analysis
  estimatedAnnualValue?: number // in INR (rewards - fees)
  rewardBreakdown?: RewardBreakdown

  // Eligibility
  eligibilityMatch: {
    income: boolean
    creditScore: boolean
    age: boolean
    overall: 'excellent' | 'good' | 'fair' | 'unlikely'
  }

  // Pros & cons
  pros: string[]
  cons: string[]

  // Usage strategy
  recommendedUsage?: string // How to maximize this card
  categoryOptimization?: string[] // Which spending categories to use this card for
}
