import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  LOCAL_CARD_CATALOG,
  isMissingCreditCardsTableError,
} from '@/lib/cards/local-catalog'

type CatalogSource = 'database' | 'local_fallback'

type CardForRecommendation = {
  id: string
  cardName: string
  bank: string
  annualFee: number
  joiningFee: number
  minAge: number | null
  maxAge: number | null
  minIncome: number | null
  minCibilScore: number | null
  bestFor: string[]
  perks: string[]
}

type FollowUpQuestion = {
  id: string
  question: string
  why: string
  options: Array<{
    value: string
    label: string
    description: string
  }>
}

const recommendationInputSchema = z.object({
  cibilScore: z.coerce.number().min(300).max(900),
  monthlyIncome: z.coerce.number().nonnegative(),
  annualIncome: z.coerce.number().nonnegative(),
  employmentType: z.string().min(1),
  primaryBank: z.string().min(1),
  city: z.string().min(1),
  existingCards: z.array(z.string()).optional().default([]),
  hasFixedDeposits: z.boolean().optional().default(false),
  fdAmount: z.coerce.number().nonnegative().optional(),
  monthlySpending: z.coerce.number().nonnegative().optional(),
  spendingBreakdown: z
    .record(z.string(), z.coerce.number().nonnegative())
    .optional()
    .default({}),
  creditGoals: z.array(z.string()).optional().default([]),
  parsedStatement: z
    .object({
      totalSpending: z.coerce.number().nonnegative().optional(),
      categoryBreakdown: z.record(z.string(), z.coerce.number().nonnegative()).optional(),
    })
    .optional(),
  followUpAnswers: z.record(z.string(), z.string()).optional().default({}),
})

const REQUIRED_FOLLOW_UP_IDS = [
  'age_band',
  'income_profile',
  'secured_card_readiness',
  'primary_spend_focus',
  'value_priority',
] as const

const DEFAULT_QUESTIONS: FollowUpQuestion[] = [
  {
    id: 'age_band',
    question: 'What is your age bracket?',
    why: 'Some Indian cards are available from 18+, while many unsecured cards start at 21+.',
    options: [
      {
        value: '18_20',
        label: '18-20',
        description: 'Prioritize FD-backed or secured card options.',
      },
      {
        value: '21_24',
        label: '21-24',
        description: 'Entry-level and starter unsecured cards are considered.',
      },
      {
        value: '25_30',
        label: '25-30',
        description: 'Broader set of cashback, rewards, and travel cards.',
      },
      {
        value: '31_plus',
        label: '31+',
        description: 'Include wider premium eligibility where relevant.',
      },
    ],
  },
  {
    id: 'income_profile',
    question: 'Which income situation best matches you right now?',
    why: 'Income stability affects unsecured card eligibility and approval odds.',
    options: [
      {
        value: 'no_personal_income',
        label: 'No personal income',
        description: 'Prioritize FD-backed or secured cards.',
      },
      {
        value: 'stipend_or_part_time',
        label: 'Stipend/part-time income',
        description: 'Mix of low-fee unsecured and secured cards.',
      },
      {
        value: 'stable_income_upto_6l',
        label: 'Stable income up to INR 6L',
        description: 'Entry-level unsecured cards become more realistic.',
      },
      {
        value: 'stable_income_above_6l',
        label: 'Stable income above INR 6L',
        description: 'Broader unsecured and premium options can be considered.',
      },
    ],
  },
  {
    id: 'secured_card_readiness',
    question: 'Are you open to FD-backed cards if they improve approval chance?',
    why: 'For many first-time users under 21 or with low income, secured cards are the practical path.',
    options: [
      {
        value: 'have_fd_now',
        label: 'Yes, I already have FD',
        description: 'Recommend secured cards first for faster approval.',
      },
      {
        value: 'can_start_fd',
        label: 'Can start an FD soon',
        description: 'Show both secured now and unsecured alternatives.',
      },
      {
        value: 'unsecured_only',
        label: 'No, only unsecured cards',
        description: 'Recommend unsecured cards only.',
      },
    ],
  },
  {
    id: 'primary_spend_focus',
    question: 'Which spending area should this card optimize first?',
    why: 'The best card changes based on your dominant spend category.',
    options: [
      {
        value: 'groceries',
        label: 'Groceries & essentials',
        description: 'Maximize everyday household cashback.',
      },
      {
        value: 'dining',
        label: 'Dining & delivery',
        description: 'Focus on food and app-order rewards.',
      },
      {
        value: 'shopping',
        label: 'Online shopping',
        description: 'Prioritize ecommerce and sale-season rewards.',
      },
      {
        value: 'travel',
        label: 'Travel & commute',
        description: 'Optimize travel and transport spends.',
      },
    ],
  },
  {
    id: 'value_priority',
    question: 'What outcome matters most from this card?',
    why: 'This decides whether we optimize for low fees, cashback, travel, or UPI usage.',
    options: [
      {
        value: 'build_credit_low_fee',
        label: 'Build credit with low fees',
        description: 'Keep costs low and improve credit history safely.',
      },
      {
        value: 'cashback_everyday',
        label: 'Max cashback on regular spends',
        description: 'Best for routine categories and simple savings.',
      },
      {
        value: 'travel_perks',
        label: 'Travel and lounge benefits',
        description: 'Prioritize cards with flight and lounge value.',
      },
      {
        value: 'upi_qr_rewards',
        label: 'UPI QR convenience',
        description: 'Prioritize RuPay/UPI-on-credit compatibility.',
      },
    ],
  },
]

const SPENDING_CATEGORY_LABELS: Record<string, string> = {
  dining: 'dining',
  online_shopping: 'online shopping',
  shopping: 'shopping',
  travel: 'travel',
  fuel: 'fuel',
  groceries: 'groceries',
  entertainment: 'entertainment',
  utilities: 'utilities and bills',
  healthcare: 'healthcare',
  education: 'education',
  other: 'general expenses',
}

const SPEND_FOCUS_DETAILS: Record<string, { label: string; description: string }> = {
  groceries: {
    label: 'Groceries & essentials',
    description: 'Maximize savings on everyday household expenses.',
  },
  dining: {
    label: 'Dining & delivery',
    description: 'Optimize food, restaurants, and delivery app spends.',
  },
  shopping: {
    label: 'Online shopping',
    description: 'Prioritize ecommerce and sale-season rewards.',
  },
  travel: {
    label: 'Travel & commute',
    description: 'Focus on flights, hotels, cabs, and local travel.',
  },
  fuel: {
    label: 'Fuel',
    description: 'Reduce fuel spend with surcharge waiver and rewards.',
  },
  utilities: {
    label: 'Bills & recharges',
    description: 'Get better value on monthly utility and recharge spends.',
  },
  education: {
    label: 'Education spends',
    description: 'Optimize tuition, courses, and related payments.',
  },
  entertainment: {
    label: 'Movies & entertainment',
    description: 'Focus on OTT, movies, and entertainment benefits.',
  },
  other: {
    label: 'Mixed spends',
    description: 'Balanced rewards across multiple categories.',
  },
}

const normalizeSpendCategory = (category: string | undefined) => {
  if (!category) return 'other'
  if (category === 'online_shopping') return 'shopping'
  return category
}

const toSpendingLabel = (category: string | undefined) => {
  if (!category) return 'daily expenses'
  return SPENDING_CATEGORY_LABELS[category] || category.replace(/_/g, ' ')
}

const buildPrimarySpendOptions = (topCategories: string[]) => {
  const fallbackOrder = [
    'groceries',
    'dining',
    'shopping',
    'travel',
    'fuel',
    'utilities',
    'education',
    'entertainment',
  ]

  const deduped: string[] = []
  for (const category of [...topCategories.map(normalizeSpendCategory), ...fallbackOrder]) {
    if (!deduped.includes(category)) {
      deduped.push(category)
    }
    if (deduped.length === 4) break
  }

  return deduped.map((category) => {
    const details = SPEND_FOCUS_DETAILS[category] || SPEND_FOCUS_DETAILS.other
    return {
      value: category,
      label: details.label,
      description: details.description,
    }
  })
}

const buildContextualFallbackQuestions = (
  input: z.infer<typeof recommendationInputSchema>
): FollowUpQuestion[] => {
  const topCategories = getTopSpendingCategories(input.spendingBreakdown)
  const primaryCategoryLabel = toSpendingLabel(topCategories[0])
  const spendOptions = buildPrimarySpendOptions(topCategories)
  const isLowIncomeOrStudent =
    input.annualIncome <= 300000 || /student|unemployed|other|homemaker/i.test(input.employmentType)
  const hasTravelGoal = (input.creditGoals || []).some((goal) =>
    /travel|lounge|vacation|miles/i.test(goal)
  )

  return DEFAULT_QUESTIONS.map((question) => {
    if (question.id === 'income_profile') {
      return {
        ...question,
        question: isLowIncomeOrStudent
          ? 'Which option best describes your current personal income setup?'
          : question.question,
      }
    }

    if (question.id === 'secured_card_readiness') {
      return {
        ...question,
        why: isLowIncomeOrStudent
          ? 'Low/no personal income users usually get better approval odds via FD-backed cards.'
          : question.why,
      }
    }

    if (question.id === 'primary_spend_focus') {
      return {
        ...question,
        question: `For your ${primaryCategoryLabel} spending, what should this card optimize first?`,
        options: spendOptions,
      }
    }

    if (question.id === 'value_priority' && hasTravelGoal) {
      return {
        ...question,
        question: 'You mentioned travel goals. What should this card optimize most?',
      }
    }

    return question
  })
}

const asString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return fallback
}

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

const asStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return []
  return value.map((item) => asString(item)).filter(Boolean)
}

const mapCatalogRow = (row: Record<string, unknown>): CardForRecommendation => {
  return {
    id: asString(row.id, crypto.randomUUID()),
    cardName: asString(row.card_name ?? row.name, 'Unknown Card'),
    bank: asString(row.bank_name ?? row.bank, 'Unknown Bank'),
    annualFee: asNumber(row.annual_fee, 0),
    joiningFee: asNumber(row.joining_fee, 0),
    minAge: row.min_age ? asNumber(row.min_age) : null,
    maxAge: row.max_age ? asNumber(row.max_age) : null,
    minIncome: row.min_income_salaried
      ? asNumber(row.min_income_salaried)
      : row.min_income_required
        ? asNumber(row.min_income_required)
        : null,
    minCibilScore: row.min_cibil_score ? asNumber(row.min_cibil_score) : null,
    bestFor: asStringArray(row.best_for),
    perks: [
      ...asStringArray(row.pros).slice(0, 4),
      ...(asString(row.description) ? [asString(row.description)] : []),
    ].filter(Boolean),
  }
}

const mapLocalCatalog = (): CardForRecommendation[] => {
  return LOCAL_CARD_CATALOG.map((card) => ({
    id: card.id,
    cardName: card.card_name,
    bank: card.bank_name,
    annualFee: card.annual_fee,
    joiningFee: card.joining_fee,
    minAge: card.min_age,
    maxAge: card.max_age,
    minIncome: card.min_income_salaried,
    minCibilScore: card.min_cibil_score,
    bestFor: card.best_for || [],
    perks: [...(card.pros || []), ...(card.description ? [card.description] : [])].slice(0, 5),
  }))
}

const normalizeBank = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

const fetchCatalog = async (supabase: Awaited<ReturnType<typeof createClient>>) => {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('is_active', true)
    .order('popularity_score', { ascending: false })
    .limit(100)

  if (error) {
    if (isMissingCreditCardsTableError(error.message)) {
      return {
        cards: mapLocalCatalog(),
        source: 'local_fallback' as CatalogSource,
      }
    }
    throw new Error(`Failed to fetch card catalog: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return {
      cards: mapLocalCatalog(),
      source: 'local_fallback' as CatalogSource,
    }
  }

  return {
    cards: data.map((row) => mapCatalogRow(row as Record<string, unknown>)),
    source: 'database' as CatalogSource,
  }
}

const getTopSpendingCategories = (spendingBreakdown: Record<string, number>) => {
  return Object.entries(spendingBreakdown)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category)
}

const CATEGORY_MATCH_PATTERNS: Record<string, RegExp> = {
  groceries: /grocery|supermarket|essential/,
  dining: /dining|restaurant|food|zomato|swiggy/,
  shopping: /shopping|online|ecommerce|flipkart|amazon/,
  travel: /travel|flight|hotel|lounge|airline|rail|cab/,
  fuel: /fuel|petrol|diesel/,
  utilities: /utility|bill|electricity|recharge|broadband/,
  education: /education|student|course|learning|tuition/,
  entertainment: /entertainment|movie|ott|streaming/,
}

const getFollowUpAnswer = (
  answers: Record<string, string>,
  keys: string[],
  fallback: string
) => {
  for (const key of keys) {
    const value = answers[key]
    if (value) return value
  }
  return fallback
}

const matchesSpendCategory = (
  category: string,
  bestFor: string[],
  cardText: string
) => {
  const normalized = normalizeSpendCategory(category)
  const aliases =
    normalized === 'shopping'
      ? ['shopping', 'online_shopping']
      : [normalized]

  if (aliases.some((alias) => bestFor.includes(alias))) {
    return true
  }

  const pattern = CATEGORY_MATCH_PATTERNS[normalized]
  return pattern ? pattern.test(cardText) : false
}

const ruleBasedRecommendations = (
  input: z.infer<typeof recommendationInputSchema>,
  cards: CardForRecommendation[]
) => {
  const answers = input.followUpAnswers || {}
  const topCategories = getTopSpendingCategories(input.spendingBreakdown).map((category) =>
    normalizeSpendCategory(category.toLowerCase())
  )
  const primaryBank = normalizeBank(input.primaryBank)
  const existingCards = new Set(
    input.existingCards.map((name) => name.toLowerCase().replace(/\s+/g, ' ').trim())
  )

  const ageBand = getFollowUpAnswer(answers, ['age_band'], '21_24')
  const incomeProfile = getFollowUpAnswer(
    answers,
    ['income_profile'],
    input.annualIncome <= 0
      ? 'no_personal_income'
      : input.annualIncome <= 300000
        ? 'stipend_or_part_time'
        : input.annualIncome <= 600000
          ? 'stable_income_upto_6l'
          : 'stable_income_above_6l'
  )
  const securedCardReadiness = getFollowUpAnswer(
    answers,
    ['secured_card_readiness'],
    input.hasFixedDeposits || (input.fdAmount || 0) > 0 ? 'have_fd_now' : 'unsecured_only'
  )
  const spendFocus = normalizeSpendCategory(
    getFollowUpAnswer(answers, ['primary_spend_focus'], topCategories[0] || 'other')
  )
  let valuePriority = getFollowUpAnswer(answers, ['value_priority'], '')

  const annualFeeTolerance = getFollowUpAnswer(
    answers,
    ['annual_fee_tolerance'],
    valuePriority === 'build_credit_low_fee' ? 'free_only' : 'up_to_1000'
  )
  const rewardPreference = getFollowUpAnswer(
    answers,
    ['reward_preference'],
    valuePriority === 'travel_perks'
      ? 'travel'
      : valuePriority === 'cashback_everyday'
        ? 'cashback'
        : 'points'
  )
  const travelFrequency = getFollowUpAnswer(
    answers,
    ['travel_frequency'],
    valuePriority === 'travel_perks' ? 'frequent' : 'rare'
  )
  const needsUpi = getFollowUpAnswer(answers, ['upi_usage'], 'not_needed') === 'critical'
    || valuePriority === 'upi_qr_rewards'

  if (!valuePriority) {
    if (rewardPreference === 'travel' || travelFrequency === 'frequent') {
      valuePriority = 'travel_perks'
    } else if (needsUpi) {
      valuePriority = 'upi_qr_rewards'
    } else if (annualFeeTolerance === 'free_only') {
      valuePriority = 'build_credit_low_fee'
    } else {
      valuePriority = 'cashback_everyday'
    }
  }

  const estimatedAge =
    ageBand === '18_20'
      ? 19
      : ageBand === '21_24'
        ? 22
        : ageBand === '25_30'
          ? 27
          : 35

  const baseEligibility = (card: CardForRecommendation) => {
    const normalizedCardName = card.cardName.toLowerCase().replace(/\s+/g, ' ').trim()
    if (existingCards.has(normalizedCardName)) {
      return false
    }
    if (card.minCibilScore && input.cibilScore < card.minCibilScore) {
      return false
    }
    if (card.minAge && estimatedAge < card.minAge) {
      return false
    }
    if (card.maxAge && estimatedAge > card.maxAge) {
      return false
    }
    return true
  }

  const strictEligibleCards = cards.filter((card) => {
    if (!baseEligibility(card)) return false
    if (card.minIncome && input.annualIncome < card.minIncome) return false
    return true
  })

  const relaxedEligibleCards = cards.filter((card) => baseEligibility(card))
  const scoringPool =
    strictEligibleCards.length > 0
      ? strictEligibleCards
      : relaxedEligibleCards.length > 0
        ? relaxedEligibleCards
        : cards

  const scoreCard = (card: CardForRecommendation) => {
    let score = 52
    const bestFor = card.bestFor.map((value) => normalizeSpendCategory(value.toLowerCase()))
    const perkText = card.perks.join(' ').toLowerCase()
    const cardText = `${card.cardName} ${card.bank} ${bestFor.join(' ')} ${perkText}`.toLowerCase()
    const hasSecuredSignals = /secured|fd|fixed deposit|wow/.test(cardText)
    const hasCashbackSignals = /cashback|statement/.test(cardText)
    const hasTravelSignals = /travel|lounge|mile|air/.test(cardText)
    const hasUpiSignals = /upi|rupay|qr/.test(cardText)

    if (primaryBank && normalizeBank(card.bank).includes(primaryBank)) {
      score += 7
    }

    for (const category of topCategories) {
      if (matchesSpendCategory(category, bestFor, cardText)) {
        score += 7
      }
    }

    if (spendFocus && matchesSpendCategory(spendFocus, bestFor, cardText)) {
      score += 10
    }

    if (valuePriority === 'build_credit_low_fee') {
      score += card.annualFee === 0 ? 10 : card.annualFee <= 500 ? 6 : -8
      if (hasSecuredSignals) score += 8
    } else if (valuePriority === 'cashback_everyday' && hasCashbackSignals) {
      score += 9
    } else if (valuePriority === 'travel_perks' && hasTravelSignals) {
      score += 10
    } else if (valuePriority === 'upi_qr_rewards' && hasUpiSignals) {
      score += 10
    }

    if (rewardPreference === 'cashback' && hasCashbackSignals) {
      score += 7
    }
    if (rewardPreference === 'travel' && hasTravelSignals) {
      score += 8
    }
    if (rewardPreference === 'points' && /reward|point/.test(cardText)) {
      score += 5
    }

    if (travelFrequency === 'frequent' && hasTravelSignals) {
      score += 7
    }
    if (needsUpi && hasUpiSignals) {
      score += 7
    }

    if (ageBand === '18_20') {
      if (hasSecuredSignals) {
        score += 12
      } else {
        score -= 9
      }
    }

    if (incomeProfile === 'no_personal_income') {
      if (card.minIncome && card.minIncome > 0) score -= 14
      if (hasSecuredSignals) score += 12
      if (card.annualFee === 0) score += 4
    } else if (incomeProfile === 'stipend_or_part_time') {
      if (card.minIncome && card.minIncome > input.annualIncome) score -= 7
      if (hasSecuredSignals) score += 6
      if (card.annualFee <= 1000) score += 4
    } else if (incomeProfile === 'stable_income_above_6l') {
      score += card.annualFee <= 5000 ? 3 : 2
    }

    if (securedCardReadiness === 'have_fd_now' || securedCardReadiness === 'can_start_fd') {
      if (hasSecuredSignals) {
        score += 10
      } else {
        score -= 2
      }
    }

    if (securedCardReadiness === 'unsecured_only' && hasSecuredSignals) {
      score -= 8
    }

    if (annualFeeTolerance === 'free_only') {
      score += card.annualFee === 0 ? 10 : -12
    } else if (annualFeeTolerance === 'up_to_1000') {
      score += card.annualFee <= 1000 ? 8 : -5
    } else if (annualFeeTolerance === 'up_to_5000') {
      score += card.annualFee <= 5000 ? 5 : -3
    } else if (annualFeeTolerance === 'premium_ok') {
      score += card.annualFee > 5000 ? 4 : 2
    }

    return {
      card,
      score: Math.max(35, Math.min(96, Math.round(score))),
    }
  }

  let ranked = scoringPool
    .map(scoreCard)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (ranked.length < 3) {
    const usedIds = new Set(ranked.map((entry) => entry.card.id))
    const extra = cards
      .filter((card) => !usedIds.has(card.id))
      .map(scoreCard)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3 - ranked.length)
    ranked = [...ranked, ...extra]
  }

  const usedRelaxedEligibility = strictEligibleCards.length === 0

  return {
    analysis: `Recommendations generated using your profile, spending patterns, and preferences.${usedRelaxedEligibility ? ' Strict income filters had no direct match, so near-fit cards (including secured options) were included.' : ''}`,
    cards: ranked.map(({ card, score }) => ({
      id: card.id,
      name: card.cardName,
      bank: card.bank,
      score,
      reason: `${card.cardName} fits your ${toSpendingLabel(spendFocus)} preference and current eligibility profile, while keeping fee-versus-benefit balance practical.`,
      keyPerks: card.perks.slice(0, 3),
      annualFee: card.annualFee,
    })),
  }
}

const saveRecommendation = async (params: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  input: z.infer<typeof recommendationInputSchema>
  cards: Array<{ id: string; name: string; bank: string; score: number; reason: string; keyPerks: string[]; annualFee: number }>
  analysis: string
  model: string
}) => {
  const { supabase, userId, input, cards, analysis, model } = params

  // Map cards to the CardRecommendation format expected by the dashboard / Recommendation type
  const normalizedCards = cards.map((card, index) => ({
    cardId: card.id,
    cardName: card.name,
    bank: card.bank,
    score: card.score,
    reasoning: card.reason,
    keyPerks: card.keyPerks,
    annualValue: card.annualFee,
    rank: index + 1,
  }))

  const recommendationPayloads: Array<Record<string, unknown>> = [
    {
      user_id: userId,
      recommendation_type: 'experienced',
      input_snapshot: input,
      recommended_cards: normalizedCards,
      ai_analysis_text: analysis,
      ai_analysis: analysis,
      model_used: model,
    },
    {
      user_id: userId,
      recommendation_type: 'experienced',
      input_snapshot: input,
      recommended_cards: normalizedCards,
      ai_analysis: analysis,
      model_used: model,
    },
    {
      user_id: userId,
      flow_type: 'experienced_user',
      input_data: input,
      recommended_cards: normalizedCards,
      ai_analysis: analysis,
      ai_model_used: model,
    },
  ]

  let recommendationId: string | null = null
  for (const payload of recommendationPayloads) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert(payload)
      .select('id')
      .single()
    if (!error && data?.id) {
      recommendationId = data.id
      break
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const creditHistoryPayloads: Array<Record<string, unknown>> = [
    {
      user_id: userId,
      credit_score: input.cibilScore,
      score_date: today,
      score_source: 'manual',
      notes: 'Captured from advisor flow',
    },
    {
      user_id: userId,
      score: input.cibilScore,
      score_date: today,
      source: 'user_input',
      notes: 'Captured from advisor flow',
    },
  ]

  for (const payload of creditHistoryPayloads) {
    const { error } = await supabase.from('credit_score_history').insert(payload)
    if (!error) break
  }

  const profilePayloads: Array<Record<string, unknown>> = [
    {
      credit_score: input.cibilScore,
      annual_income: input.annualIncome,
      employment_type: input.employmentType,
      primary_bank: input.primaryBank,
      city: input.city,
      updated_at: new Date().toISOString(),
    },
    {
      cibil_score: input.cibilScore,
      monthly_income: input.monthlyIncome,
      employment_type: input.employmentType,
      primary_bank: input.primaryBank,
      city: input.city,
      updated_at: new Date().toISOString(),
    },
  ]

  for (const payload of profilePayloads) {
    const { error } = await supabase.from('profiles').update(payload).eq('id', userId)
    if (!error) break
  }

  return recommendationId
}

const hasFollowUpAnswers = (answers: Record<string, string>) => {
  const hasRequiredAnswers = REQUIRED_FOLLOW_UP_IDS.every((id) => Boolean(answers[id]))
  if (hasRequiredAnswers) return true
  return Object.values(answers).filter(Boolean).length >= 5
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json()
    const parsedBody = recommendationInputSchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid recommendation input', details: parsedBody.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsedBody.data

    // Fetch user's spending transactions to enhance spendingBreakdown
    const { data: txnData } = await supabase
      .from('spending_transactions')
      .select('category, amount')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(200)

    if (txnData && txnData.length > 0) {
      const txnBreakdown: Record<string, number> = {}
      for (const txn of txnData) {
        const cat = (txn.category as string) || 'other'
        txnBreakdown[cat] = (txnBreakdown[cat] || 0) + Number(txn.amount || 0)
      }
      // Merge transaction data into spendingBreakdown (transaction data supplements user input)
      for (const [cat, amount] of Object.entries(txnBreakdown)) {
        input.spendingBreakdown[cat] = (input.spendingBreakdown[cat] || 0) + amount
      }
    }

    const { cards, source: catalogSource } = await fetchCatalog(supabase)

    if (cards.length === 0) {
      return NextResponse.json(
        { error: 'Card catalog is unavailable. Please retry in a moment.' },
        { status: 503 }
      )
    }

    // If follow-up answers are not provided, return questions
    if (!hasFollowUpAnswers(input.followUpAnswers)) {
      return NextResponse.json({
        status: 'needs_more_info',
        questions: buildContextualFallbackQuestions(input),
        metadata: {
          model: 'rule_based',
          catalogSource,
        },
      })
    }

    // Generate rule-based recommendations
    const result = ruleBasedRecommendations(input, cards)

    const recommendationId = await saveRecommendation({
      supabase,
      userId: user.id,
      input,
      cards: result.cards,
      analysis: result.analysis,
      model: 'rule_based',
    })

    return NextResponse.json({
      status: 'success',
      cards: result.cards.map((card) => ({
        id: card.id,
        name: card.name,
        bank: card.bank,
        score: card.score,
        reason: card.reason,
        annualFee: card.annualFee,
        pros: card.keyPerks,
        bestCategories: [],
      })),
      analysis: result.analysis,
      recommendationId,
      metadata: {
        model: 'rule_based',
        catalogSource,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Recommendation error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
