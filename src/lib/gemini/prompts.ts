// AI prompt templates for credit card recommendations

import type { BeginnerInput } from '@/types/financial-profile'
import type { CreditCard } from '@/types/credit-card'

export const BEGINNER_RECOMMENDATION_PROMPT = `
You are an expert credit card advisor for Indian users. Analyze the beginner user's profile and recommend the top 3 credit cards.

User Profile:
{profile}

Available Cards (pre-filtered by eligibility):
{cards}

Provide your response as JSON with this structure:
{
  "recommendations": [
    {
      "cardId": "uuid",
      "cardName": "Card Name",
      "bank": "Bank Name",
      "score": 85,
      "reasoning": "Why this card is perfect for this beginner...",
      "annualValue": 5000
    }
  ],
  "application_guide": {
    "steps": ["Step 1...", "Step 2..."],
    "documents_needed": ["PAN card", "Aadhaar..."],
    "tips": ["Tip 1...", "Tip 2..."]
  },
  "credit_education": {
    "topics": ["Credit utilization", "Payment discipline..."],
    "tips": ["Pay full balance every month...", "Never miss payment dates..."]
  },
  "overall_analysis": "Summary of user's profile and recommendation strategy..."
}

Important:
- Focus on entry-level cards with low fees and easy approval
- Prioritize cards with simple reward structures
- Include educational guidance for first-time users
- Consider cards from their primary bank for easier approval
- Keep reasoning beginner-friendly and encouraging
- Use Indian currency formatting (₹ symbol, lakh notation where appropriate)
- Assess realistic approval likelihood based on age, income, employment, and banking relationship
- Highlight beginner-friendly features like low/no annual fees, simple reward redemption
`

export const EXPERIENCED_RECOMMENDATION_PROMPT = `
You are an expert credit card advisor for Indian users. Analyze this experienced user's complete financial profile and recommend the top 5 credit cards with detailed reward analysis.

User Profile:
{profile}

Spending Analysis (monthly):
{spending}

Available Cards (pre-filtered by income and CIBIL):
{cards}

Existing Cards:
{existingCards}

Provide your response as JSON with this structure:
{
  "recommendations": [
    {
      "cardId": "uuid",
      "cardName": "Card Name",
      "bank": "Bank Name",
      "score": 92,
      "reasoning": "Detailed analysis of why this card fits...",
      "rewardBreakdown": {
        "estimatedAnnualRewards": 25000,
        "categoryBreakdown": [
          {
            "category": "Dining",
            "monthlySpend": 15000,
            "rewardRate": 5,
            "monthlyRewards": 750,
            "annualRewards": 9000
          }
        ],
        "fees": {
          "joining": 2500,
          "annual": 2500,
          "total": 5000
        },
        "netValue": 20000
      },
      "annualValue": 20000
    }
  ],
  "portfolio_strategy": "Detailed strategy for optimizing card portfolio...",
  "reward_optimization": {
    "recommendedUsage": {
      "Card A": ["Dining", "Travel"],
      "Card B": ["Groceries", "Utilities"]
    },
    "potentialAnnualSavings": 35000
  },
  "spending_insights": {
    "topCategories": ["Dining - ₹18,000/month", "Travel - ₹12,000/month"],
    "opportunities": ["You could save ₹5,000/year by switching fuel card..."]
  }
}

Important:
- Calculate actual reward values based on user's spending patterns
- Consider card portfolio optimization (avoid overlapping benefits)
- Account for annual fees in net value calculation
- Prioritize premium cards if income and CIBIL support it
- Provide data-driven insights and specific savings estimates
`

export const PDF_CATEGORIZATION_PROMPT = `
You are a transaction categorization expert for Indian bank statements. Analyze these transaction lines and categorize them.

Transactions:
{transactions}

Categories: dining, groceries, travel, fuel, shopping, utilities, entertainment, healthcare, education, bills, other

Provide your response as JSON:
{
  "transactions": [
    {
      "original": "SWIGGY 12-JAN ₹450",
      "date": "2024-01-12",
      "amount": 450,
      "merchant": "Swiggy",
      "category": "dining"
    }
  ]
}

Important:
- Recognize common Indian merchants and apps (Swiggy, Zomato, Amazon, Flipkart, Rapido, Ola, Uber, BigBasket, etc.)
- Handle various date formats and transaction descriptions
- Be accurate with amount extraction
- Use "other" category only when genuinely unclear
`

/**
 * Build a comprehensive prompt for Gemini AI to recommend credit cards for beginner users
 * @param userData - Beginner user input from the questionnaire
 * @param availableCards - Pre-filtered credit cards that the user is eligible for
 * @returns Formatted prompt string for Gemini
 */
export function buildBeginnerPrompt(userData: BeginnerInput, availableCards: CreditCard[]): string {
  // Format user profile with Indian currency notation
  const formattedProfile = {
    age: userData.age,
    city: userData.city,
    employmentType: userData.employmentType,
    monthlyIncome: `₹${formatIndianCurrency(userData.monthlyIncome)}`,
    annualIncome: `₹${formatIndianCurrency(userData.monthlyIncome * 12)}`,
    primaryBank: userData.primaryBank,
    hasBankAccount: userData.hasBankAccount,
    accountAge: userData.accountAge ? `${userData.accountAge} months` : 'Unknown',
    spendingProfile: {
      averageMonthlySpend: `₹${formatIndianCurrency(userData.averageMonthlySpend)}`,
      primaryCategories: userData.primarySpendCategories,
    },
    goals: userData.creditGoals,
    preferredCardType: userData.preferredCardType || 'Not specified',
  }

  // Format cards with relevant beginner-friendly information
  const formattedCards = availableCards.map((card) => ({
    id: card.id,
    bank: card.bank_name,
    name: card.card_name,
    type: card.card_type,
    joiningFee: `₹${formatIndianCurrency(card.joining_fee)}`,
    annualFee: `₹${formatIndianCurrency(card.annual_fee)}`,
    feeWaiverSpend: card.annual_fee_waiver_spend
      ? `₹${formatIndianCurrency(card.annual_fee_waiver_spend)}`
      : 'N/A',
    minIncome: card.min_income_salaried
      ? `₹${formatIndianCurrency(card.min_income_salaried)}/year`
      : 'Not specified',
    requiresExistingRelationship: card.requires_existing_relationship,
    rewardRate: card.reward_rate_default,
    loungeAccess: card.lounge_access,
    fuelSurchargeWaiver: card.fuel_surcharge_waiver,
    bestFor: card.best_for,
    pros: card.pros,
    cons: card.cons,
  }))

  return BEGINNER_RECOMMENDATION_PROMPT
    .replace('{profile}', JSON.stringify(formattedProfile, null, 2))
    .replace('{cards}', JSON.stringify(formattedCards, null, 2))
}

export function buildExperiencedPrompt(
  profile: Record<string, unknown>,
  spending: Record<string, unknown>,
  cards: Array<Record<string, unknown>>,
  existingCards: Array<Record<string, unknown> | string>
): string {
  return EXPERIENCED_RECOMMENDATION_PROMPT.replace(
    '{profile}',
    JSON.stringify(profile, null, 2)
  )
    .replace('{spending}', JSON.stringify(spending, null, 2))
    .replace('{cards}', JSON.stringify(cards, null, 2))
    .replace('{existingCards}', JSON.stringify(existingCards, null, 2))
}

export function buildCategorizationPrompt(transactions: string[]): string {
  return PDF_CATEGORIZATION_PROMPT.replace('{transactions}', JSON.stringify(transactions, null, 2))
}

/**
 * Format numbers in Indian currency notation (lakhs, crores)
 * @param amount - Amount in rupees
 * @returns Formatted string (e.g., "5,00,000" or "5 Lakhs")
 */
function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`
  } else if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} L`
  } else {
    return new Intl.NumberFormat('en-IN').format(amount)
  }
}
