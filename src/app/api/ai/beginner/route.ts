import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { BeginnerInput } from '@/types/financial-profile'
import type { CreditCard } from '@/types/credit-card'
import type { CreditCard as LegacyCard } from '@/types'
import { cards as localCards } from '@/data/cards'

const MIN_BEGINNER_RECOMMENDATIONS = 3

const toAppCardType = (value: string): CreditCard['card_type'] => {
  const normalized = value.toLowerCase()
  if (normalized === 'entry-level') return 'entry_level'
  if (normalized === 'cashback') return 'cashback'
  if (normalized === 'rewards') return 'rewards'
  if (normalized === 'travel') return 'travel'
  if (normalized === 'fuel') return 'fuel'
  if (normalized === 'premium') return 'premium'
  if (normalized === 'super_premium') return 'super_premium'
  if (normalized === 'business') return 'business'
  if (normalized === 'secured') return 'secured'
  return 'rewards'
}

const toAppCardNetwork = (value: string): CreditCard['card_network'] => {
  const normalized = value.toLowerCase()
  if (normalized === 'visa') return 'visa'
  if (normalized === 'mastercard') return 'mastercard'
  if (normalized === 'rupay') return 'rupay'
  if (normalized === 'amex') return 'amex'
  if (normalized === 'diners') return 'diners'
  return 'visa'
}

const CARD_AGE_RULES: Record<string, { minAge: number; maxAge: number }> = {
  'idfc-first-wow': { minAge: 18, maxAge: 65 },
}

const mapLocalCardToDbShape = (card: LegacyCard): CreditCard => {
  const now = new Date().toISOString()
  const ageRule = CARD_AGE_RULES[card.id] ?? { minAge: 21, maxAge: 65 }

  return {
    id: card.id,
    bank_name: card.issuer,
    card_name: card.name,
    card_network: toAppCardNetwork(card.network),
    card_type: toAppCardType(card.type),
    card_variant: 'classic',
    image_url: null,
    joining_fee: card.joiningFee,
    annual_fee: card.annualFee,
    annual_fee_waiver_spend: null,
    renewal_fee: card.annualFee,
    min_income_salaried: card.minIncomeRequired > 0 ? card.minIncomeRequired : null,
    min_income_self_employed: card.minIncomeRequired > 0 ? card.minIncomeRequired : null,
    min_cibil_score: 700,
    min_age: ageRule.minAge,
    max_age: ageRule.maxAge,
    requires_itr: false,
    requires_existing_relationship: false,
    reward_rate_default: card.rewardRate,
    reward_rate_categories: {},
    welcome_benefits: null,
    milestone_benefits: null,
    lounge_access: card.loungeAccess ? 'domestic_only' : 'none',
    lounge_visits_per_quarter: card.loungeAccess ? 1 : 0,
    fuel_surcharge_waiver: card.fuelSurchargeWaiver,
    fuel_surcharge_waiver_cap: null,
    movie_benefits: null,
    dining_benefits: null,
    travel_insurance_cover: null,
    purchase_protection_cover: null,
    golf_access: false,
    concierge_service: false,
    forex_markup: null,
    emi_conversion_available: true,
    description: card.rewardDescription,
    pros: card.benefits.slice(0, 4),
    cons: [],
    best_for: card.bestFor.map((value) => String(value)),
    apply_url: card.applyUrl,
    is_active: true,
    popularity_score: Math.round(card.rating * 20),
    created_at: now,
    updated_at: now,
  }
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

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.map((item) => asString(item)).filter(Boolean)
}

const normalizeDbCardRow = (row: Record<string, unknown>): CreditCard => {
  const now = new Date().toISOString()

  return {
    id: asString(row.id, crypto.randomUUID()),
    bank_name: asString(row.bank_name ?? row.bank, 'Unknown Bank'),
    card_name: asString(row.card_name, 'Unknown Card'),
    card_network: toAppCardNetwork(asString(row.card_network ?? row.network, 'visa')),
    card_type: toAppCardType(asString(row.card_type, 'rewards')),
    card_variant: asString(row.card_variant, 'classic') as CreditCard['card_variant'],
    image_url: asString(row.image_url || null),
    joining_fee: asNumber(row.joining_fee, 0),
    annual_fee: asNumber(row.annual_fee, 0),
    annual_fee_waiver_spend: row.annual_fee_waiver_spend ? asNumber(row.annual_fee_waiver_spend) : null,
    renewal_fee: asNumber(row.renewal_fee ?? row.annual_fee, 0),
    min_income_salaried: row.min_income_salaried
      ? asNumber(row.min_income_salaried)
      : (row.min_income_required ? asNumber(row.min_income_required) : null),
    min_income_self_employed: row.min_income_self_employed
      ? asNumber(row.min_income_self_employed)
      : (row.min_income_required ? asNumber(row.min_income_required) : null),
    min_cibil_score: asNumber(row.min_cibil_score, 700),
    min_age: asNumber(row.min_age, 21),
    max_age: asNumber(row.max_age, 65),
    requires_itr: Boolean(row.requires_itr),
    requires_existing_relationship: Boolean(row.requires_existing_relationship),
    reward_rate_default: asNumber(row.reward_rate_default, 1),
    reward_rate_categories: typeof row.reward_rate_categories === 'object' && row.reward_rate_categories
      ? (row.reward_rate_categories as CreditCard['reward_rate_categories'])
      : {},
    welcome_benefits: typeof row.welcome_benefits === 'object'
      ? (row.welcome_benefits as CreditCard['welcome_benefits'])
      : null,
    milestone_benefits: typeof row.milestone_benefits === 'object'
      ? (row.milestone_benefits as CreditCard['milestone_benefits'])
      : null,
    lounge_access: asString(row.lounge_access, 'none'),
    lounge_visits_per_quarter: asNumber(row.lounge_visits_per_quarter, 0),
    fuel_surcharge_waiver: Boolean(row.fuel_surcharge_waiver),
    fuel_surcharge_waiver_cap: row.fuel_surcharge_waiver_cap ? asNumber(row.fuel_surcharge_waiver_cap) : null,
    movie_benefits: row.movie_benefits ? asString(row.movie_benefits) : null,
    dining_benefits: row.dining_benefits ? asString(row.dining_benefits) : null,
    travel_insurance_cover: row.travel_insurance_cover ? asNumber(row.travel_insurance_cover) : null,
    purchase_protection_cover: row.purchase_protection_cover ? asNumber(row.purchase_protection_cover) : null,
    golf_access: Boolean(row.golf_access),
    concierge_service: Boolean(row.concierge_service),
    forex_markup: row.forex_markup ? asNumber(row.forex_markup) : null,
    emi_conversion_available: Boolean(row.emi_conversion_available ?? true),
    description: row.description ? asString(row.description) : null,
    pros: asStringArray(row.pros),
    cons: asStringArray(row.cons),
    best_for: asStringArray(row.best_for),
    apply_url: row.apply_url ? asString(row.apply_url) : null,
    is_active: row.is_active !== false,
    popularity_score: asNumber(row.popularity_score, 50),
    created_at: asString(row.created_at, now),
    updated_at: asString(row.updated_at, now),
  }
}

async function fetchBeginnerCards(supabase: Awaited<ReturnType<typeof createClient>>) {
  const primaryQuery = await supabase
    .from('credit_cards')
    .select('*')
    .eq('is_active', true)
    .order('popularity_score', { ascending: false })
    .limit(20)

  if (!primaryQuery.error && primaryQuery.data && primaryQuery.data.length > 0) {
    return {
      cards: primaryQuery.data.map((row) => normalizeDbCardRow(row as Record<string, unknown>)),
      usedFallback: false,
    }
  }

  const secondaryQuery = await supabase
    .from('credit_cards')
    .select('*')
    .order('popularity_score', { ascending: false })
    .limit(20)

  if (!secondaryQuery.error && secondaryQuery.data && secondaryQuery.data.length > 0) {
    return {
      cards: secondaryQuery.data.map((row) => normalizeDbCardRow(row as Record<string, unknown>)),
      usedFallback: false,
    }
  }

  const fallbackCards = localCards.slice(0, 20).map(mapLocalCardToDbShape)
  return {
    cards: fallbackCards,
    usedFallback: true,
  }
}

const ensureCatalogDepth = (cards: CreditCard[], minCount = MIN_BEGINNER_RECOMMENDATIONS) => {
  if (cards.length >= minCount) return cards

  const merged = new Map(cards.map((card) => [card.id, card]))
  const fallbackCards = localCards.map(mapLocalCardToDbShape)
  for (const fallbackCard of fallbackCards) {
    if (!merged.has(fallbackCard.id)) {
      merged.set(fallbackCard.id, fallbackCard)
    }
    if (merged.size >= minCount) break
  }

  return Array.from(merged.values())
}

const clampScore = (value: number) => Math.max(45, Math.min(95, Math.round(value)))

type BeginnerRecommendationItem = {
  cardId: string
  cardName: string
  bank: string
  score: number
  reasoning: string
  annualValue: number
  keyPerks: string[]
  benefitSummary: string[]
}

const DEFAULT_APPLICATION_GUIDE = {
  steps: [
    'Check your eligibility and required minimum income before applying.',
    'Keep PAN, Aadhaar, and latest income proof ready.',
    'Apply for only one card first to avoid multiple hard enquiries.',
  ],
  documents_needed: ['PAN card', 'Aadhaar card', 'Address proof', 'Income proof (salary slip or bank statement)'],
  tips: [
    'Start with a low-fee or lifetime-free card.',
    'Pay total due every month to build credit history.',
    'Keep utilization below 30% of your credit limit.',
  ],
}

const DEFAULT_CREDIT_EDUCATION = {
  topics: ['On-time payments', 'Credit utilization', 'Statement cycle and due date'],
  tips: [
    'Always set payment reminders.',
    'Avoid cash withdrawals on credit cards.',
    'Review monthly statement for unauthorized transactions.',
  ],
}

const SPEND_CATEGORY_LABELS: Record<string, string> = {
  groceries: 'groceries',
  dining: 'dining & delivery',
  online_shopping: 'online shopping',
  shopping: 'online shopping',
  fuel: 'fuel',
  utilities: 'bills & utilities',
  entertainment: 'entertainment',
  travel: 'travel',
  healthcare: 'healthcare',
  education: 'education',
  other: 'daily spends',
}

const normalizeSpendCategory = (category: string) => {
  if (category === 'online_shopping') return 'shopping'
  return category
}

const formatSpendCategory = (category: string) => {
  const normalized = normalizeSpendCategory(category)
  return SPEND_CATEGORY_LABELS[normalized] || normalized.replace(/_/g, ' ')
}

const uniqueStrings = (items: string[]) => {
  const result: string[] = []
  for (const item of items) {
    const clean = item.trim()
    if (!clean) continue
    const exists = result.some((value) => value.toLowerCase() === clean.toLowerCase())
    if (!exists) {
      result.push(clean)
    }
  }
  return result
}

const isSecuredFriendlyCard = (card: CreditCard) => {
  const text = `${card.card_name} ${card.card_type} ${card.description || ''} ${(card.pros || []).join(' ')}`.toLowerCase()
  return card.card_type === 'secured' || /secured|fd|fixed deposit|wow/.test(text)
}

const estimateAnnualValue = (input: BeginnerInput, card: CreditCard) => {
  const monthlyRewards = input.averageMonthlySpend * Math.max(0.005, card.reward_rate_default / 100)
  return Math.max(0, Math.round(monthlyRewards * 12 - card.annual_fee))
}

const scoreCardsForBeginner = (input: BeginnerInput, cards: CreditCard[]) => {
  const preferredType = input.preferredCardType?.toLowerCase().replace('-', '_')
  const spendCategories = (input.primarySpendCategories || []).map((value) => normalizeSpendCategory(value.toLowerCase()))
  const annualIncome = input.monthlyIncome * 12
  const primaryBank = input.primaryBank?.toLowerCase() || ''
  const age = input.age

  const scoreCard = (card: CreditCard) => {
    let score = 55
    const cardBestFor = (card.best_for || []).map((value) => normalizeSpendCategory(value.toLowerCase()))
    const securedFriendly = isSecuredFriendlyCard(card)

    if (primaryBank && card.bank_name.toLowerCase().includes(primaryBank)) {
      score += 10
    }
    if (preferredType && card.card_type === preferredType) {
      score += 10
    }
    if (card.annual_fee === 0) {
      score += 8
    } else if (card.annual_fee <= 1000) {
      score += 4
    } else if (card.annual_fee > 5000) {
      score -= 4
    }

    const categoryMatches = cardBestFor.reduce((count, category) => {
      return spendCategories.includes(category) ? count + 1 : count
    }, 0)
    score += Math.min(categoryMatches * 5, 15)

    if (!card.min_income_salaried || annualIncome >= card.min_income_salaried) {
      score += 8
    } else {
      score -= 10
    }
    if (age >= card.min_age && age <= card.max_age) {
      score += 6
    } else {
      score -= 12
    }

    if (age < 21 || annualIncome === 0) {
      if (securedFriendly) {
        score += 10
      } else {
        score -= 6
      }
    }

    return {
      card,
      score: clampScore(score),
    }
  }

  const ageEligibleCards = cards.filter((card) => input.age >= card.min_age && input.age <= card.max_age)
  const primaryPool = ageEligibleCards.length > 0 ? ageEligibleCards : cards
  let ranked = primaryPool.map(scoreCard).sort((a, b) => b.score - a.score)

  if (ranked.length < MIN_BEGINNER_RECOMMENDATIONS) {
    const usedIds = new Set(ranked.map((entry) => entry.card.id))
    const extras = cards
      .filter((card) => !usedIds.has(card.id))
      .map(scoreCard)
      .sort((a, b) => b.score - a.score)
    ranked = [...ranked, ...extras]
  }

  return ranked
}

const buildRecommendationDetails = (params: {
  input: BeginnerInput
  card: CreditCard
  score: number
}): BeginnerRecommendationItem => {
  const { input, card, score } = params
  const annualIncome = input.monthlyIncome * 12
  const spendCategories = (input.primarySpendCategories || []).map((value) => normalizeSpendCategory(value.toLowerCase()))
  const cardCategories = (card.best_for || []).map((value) => normalizeSpendCategory(value.toLowerCase()))
  const matchedCategories = spendCategories.filter((category) => cardCategories.includes(category))
  const securedFriendly = isSecuredFriendlyCard(card)
  const isPrimaryBankCard = Boolean(input.primaryBank && card.bank_name.toLowerCase().includes(input.primaryBank.toLowerCase()))

  const spendFocusText = matchedCategories.length > 0
    ? matchedCategories.slice(0, 2).map(formatSpendCategory).join(' and ')
    : spendCategories.length > 0
      ? spendCategories.slice(0, 2).map(formatSpendCategory).join(' and ')
      : 'your regular spending'

  const keyPerks = uniqueStrings([
    ...(card.pros || []),
    card.annual_fee === 0 ? 'Zero annual fee structure' : card.annual_fee <= 1000 ? `Low annual fee (INR ${card.annual_fee.toLocaleString('en-IN')})` : '',
    card.reward_rate_default > 0 ? `${card.reward_rate_default}% base reward rate on eligible spends` : '',
    card.fuel_surcharge_waiver ? 'Fuel surcharge waiver on eligible transactions' : '',
    card.lounge_access !== 'none' ? `Lounge access support (${card.lounge_access.replace(/_/g, ' ')})` : '',
    card.emi_conversion_available ? 'EMI conversion available for large purchases' : '',
  ]).slice(0, 4)

  const benefitSummary = uniqueStrings([
    `Better value on your ${spendFocusText} spend pattern.`,
    card.annual_fee <= 1000 ? 'Keeps yearly card cost controlled while you build credit history.' : '',
    securedFriendly && (input.age < 21 || annualIncome === 0)
      ? 'Secured/FD-backed structure can improve approval chances for student or low-income profiles.'
      : '',
    isPrimaryBankCard ? `Existing relationship with ${card.bank_name} may make onboarding smoother.` : '',
    !card.min_income_salaried || annualIncome >= card.min_income_salaried
      ? 'Your current income profile aligns with typical eligibility expectations for this card.'
      : 'This card can still be explored, but approval may depend on additional bank-level checks.',
  ]).slice(0, 3)

  const reasoning = `${card.card_name} suits you because it aligns with ${spendFocusText}, keeps fee-to-value practical, and matches your current beginner eligibility profile.`

  return {
    cardId: card.id,
    cardName: card.card_name,
    bank: card.bank_name,
    score: clampScore(score),
    reasoning,
    annualValue: estimateAnnualValue(input, card),
    keyPerks,
    benefitSummary,
  }
}

const buildDeterministicRecommendations = (input: BeginnerInput, cards: CreditCard[]) => {
  const rankedCards = scoreCardsForBeginner(input, cards)
  return rankedCards
    .slice(0, MIN_BEGINNER_RECOMMENDATIONS)
    .map(({ card, score }) => buildRecommendationDetails({ input, card, score }))
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BeginnerInput = await request.json()

    const fetchedCatalog = await fetchBeginnerCards(supabase)
    const cards = ensureCatalogDepth(fetchedCatalog.cards)
    const usedFallback = fetchedCatalog.usedFallback || cards.length > fetchedCatalog.cards.length

    if (!cards || cards.length === 0) {
      return NextResponse.json({
        error: 'Card catalog is currently unavailable. Please try again in a moment.'
      }, { status: 503 })
    }

    const recommendations = buildDeterministicRecommendations(body, cards)

    const finalResponse = {
      recommendations,
      application_guide: DEFAULT_APPLICATION_GUIDE,
      credit_education: DEFAULT_CREDIT_EDUCATION,
      overall_analysis: 'Recommendations generated based on your profile, eligibility, and spending patterns.',
    }

    // Save recommendation to database
    const primarySavePayloads: Array<Record<string, unknown>> = [
      {
        user_id: user.id,
        recommendation_type: 'beginner',
        input_snapshot: body,
        recommended_cards: finalResponse.recommendations,
        ai_analysis_text: finalResponse.overall_analysis,
        application_guide: finalResponse.application_guide,
        model_used: 'rule_based',
      },
      {
        user_id: user.id,
        recommendation_type: 'beginner',
        input_snapshot: body,
        recommended_cards: finalResponse.recommendations,
        ai_analysis: finalResponse.overall_analysis,
        application_guide: finalResponse.application_guide,
        model_used: 'rule_based',
      },
    ]

    let savedRecId: string | undefined
    for (const payload of primarySavePayloads) {
      const result = await supabase
        .from('recommendations')
        .insert(payload)
        .select('id')
        .single()
      if (!result.error && result.data?.id) {
        savedRecId = result.data.id
        break
      }
    }

    if (!savedRecId) {
      const legacySave = await supabase
        .from('recommendations')
        .insert({
          user_id: user.id,
          flow_type: 'beginner',
          input_data: body,
          recommended_cards: finalResponse.recommendations,
          ai_analysis: finalResponse.overall_analysis,
          ai_model_used: 'rule_based',
        } as unknown as Record<string, unknown>)
        .select('id')
        .single()

      if (legacySave.error) {
        console.error('Error saving beginner recommendation:', legacySave.error)
      } else {
        savedRecId = legacySave.data?.id as string | undefined
      }
    }

    return NextResponse.json({
      success: true,
      recommendation_id: savedRecId,
      fallback_catalog: usedFallback,
      data: finalResponse,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    console.error('Beginner API error:', error)
    return NextResponse.json({
      error: `Failed to generate recommendations. ${message}`
    }, { status: 500 })
  }
}
