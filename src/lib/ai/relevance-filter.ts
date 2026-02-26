export const CHAT_RELEVANCE_REFUSAL_MESSAGE =
  'I can only help with Indian credit cards and personal finance. Please ask about Indian cards, CIBIL score, rewards, fees, eligibility, EMI, budgeting, or banking products.'

const FINANCE_KEYWORDS = [
  'credit card',
  'card',
  'cibil',
  'credit score',
  'cashback',
  'reward',
  'lounge',
  'annual fee',
  'joining fee',
  'forex',
  'emi',
  'loan',
  'interest',
  'apr',
  'bank',
  'banking',
  'salary account',
  'statement',
  'budget',
  'spending',
  'fd',
  'fixed deposit',
  'personal finance',
]

const INDIA_MARKET_KEYWORDS = [
  'india',
  'indian',
  'inr',
  'rupee',
  'rupees',
  'rs ',
  'rs.',
  '₹',
  'cibil',
  'rbi',
  'upi',
  'rupay',
  'hdfc',
  'icici',
  'sbi',
  'axis bank',
  'kotak',
  'yes bank',
  'idfc',
]

const FOREIGN_MARKET_KEYWORDS = [
  'usa',
  'united states',
  'us credit card',
  'uk',
  'united kingdom',
  'canada',
  'australia',
  'singapore',
  'europe',
  'eurozone',
  'amex us',
  'chase',
  'capital one',
  'discover',
]

const CLEARLY_UNRELATED_KEYWORDS = [
  'weather',
  'movie',
  'song',
  'poem',
  'recipe',
  'football',
  'cricket score',
  'javascript',
  'typescript',
  'python code',
  'debug code',
  'translate',
  'medical diagnosis',
]

const INVESTING_ONLY_KEYWORDS = ['stock tip', 'crypto', 'bitcoin', 'futures', 'options trading', 'day trading']

const includesAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword))

export interface RelevanceDecision {
  isRelevant: boolean
  reason:
    | 'empty_query'
    | 'unrelated_domain'
    | 'non_finance_query'
    | 'foreign_market_query'
    | 'investing_out_of_scope'
    | 'allowed_indian_or_neutral_finance'
}

export function classifyIndianFinanceRelevance(input: string): RelevanceDecision {
  const text = input.trim().toLowerCase()

  if (!text) {
    return {
      isRelevant: false,
      reason: 'empty_query',
    }
  }

  const hasFinanceIntent = includesAny(text, FINANCE_KEYWORDS)
  const hasIndiaSignal = includesAny(text, INDIA_MARKET_KEYWORDS)
  const hasForeignMarketSignal = includesAny(text, FOREIGN_MARKET_KEYWORDS)
  const isClearlyUnrelated = includesAny(text, CLEARLY_UNRELATED_KEYWORDS)
  const isInvestingOnly = includesAny(text, INVESTING_ONLY_KEYWORDS)

  if (isClearlyUnrelated && !hasFinanceIntent) {
    return {
      isRelevant: false,
      reason: 'unrelated_domain',
    }
  }

  if (!hasFinanceIntent) {
    return {
      isRelevant: false,
      reason: 'non_finance_query',
    }
  }

  if (hasForeignMarketSignal && !hasIndiaSignal) {
    return {
      isRelevant: false,
      reason: 'foreign_market_query',
    }
  }

  if (isInvestingOnly && !text.includes('credit card') && !text.includes('bank')) {
    return {
      isRelevant: false,
      reason: 'investing_out_of_scope',
    }
  }

  return {
    isRelevant: true,
    reason: 'allowed_indian_or_neutral_finance',
  }
}
