import { cards as legacyCards } from '@/data/cards'
import type { CreditCard as LegacyCreditCard } from '@/types'
import type { CreditCard, CreditCardListItem } from '@/types/credit-card'

const BANK_NAME_MAP: Record<string, string> = {
  HDFC: 'HDFC Bank',
  SBI: 'State Bank of India (SBI)',
  ICICI: 'ICICI Bank',
  Axis: 'Axis Bank',
  Kotak: 'Kotak Mahindra Bank',
  Amex: 'American Express (Amex)',
  RBL: 'RBL Bank',
  IndusInd: 'IndusInd Bank',
  'IDFC First': 'IDFC First Bank',
  'Yes Bank': 'Yes Bank',
  'AU Small Finance': 'AU Small Finance Bank',
  'Federal Bank': 'Federal Bank',
}

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
  if (normalized === 'lifestyle') return 'rewards'
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

const toPopularityScore = (rating: number) => {
  const rawScore = Math.round(rating * 20)
  return Math.max(0, Math.min(100, rawScore))
}

const toBankName = (issuer: string) => {
  return BANK_NAME_MAP[issuer] ?? issuer
}

const CARD_AGE_RULES: Record<string, { minAge: number; maxAge: number }> = {
  'idfc-first-wow': { minAge: 18, maxAge: 65 },
}

const now = new Date().toISOString()

const mapLegacyCardToCreditCard = (card: LegacyCreditCard): CreditCard => {
  const minIncome = card.minIncomeRequired > 0 ? card.minIncomeRequired : null
  const hasLoungeAccess = Boolean(card.loungeAccess)
  const ageRule = CARD_AGE_RULES[card.id] ?? { minAge: 21, maxAge: 65 }

  return {
    id: card.id,
    bank_name: toBankName(card.issuer),
    card_name: card.name,
    card_network: toAppCardNetwork(card.network),
    card_type: toAppCardType(card.type),
    card_variant: 'classic',
    image_url: null,
    joining_fee: card.joiningFee,
    annual_fee: card.annualFee,
    annual_fee_waiver_spend: null,
    renewal_fee: card.annualFee,
    min_income_salaried: minIncome,
    min_income_self_employed: minIncome,
    min_cibil_score: 700,
    min_age: ageRule.minAge,
    max_age: ageRule.maxAge,
    requires_itr: false,
    requires_existing_relationship: false,
    reward_rate_default: card.rewardRate,
    reward_rate_categories: {},
    welcome_benefits: null,
    milestone_benefits: null,
    lounge_access: hasLoungeAccess ? 'domestic_only' : 'none',
    lounge_visits_per_quarter: hasLoungeAccess ? 1 : 0,
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
    popularity_score: toPopularityScore(card.rating),
    created_at: now,
    updated_at: now,
  }
}

export const LOCAL_CARD_CATALOG: CreditCard[] = legacyCards.map(mapLegacyCardToCreditCard)

export const toCreditCardListItem = (card: CreditCard): CreditCardListItem => ({
  id: card.id,
  bank_name: card.bank_name,
  card_name: card.card_name,
  card_type: card.card_type,
  annual_fee: card.annual_fee,
  reward_rate_default: card.reward_rate_default,
  lounge_access: card.lounge_access,
  best_for: card.best_for,
  popularity_score: card.popularity_score,
})

export const getLocalCreditCardById = (id: string) => {
  return LOCAL_CARD_CATALOG.find((card) => card.id === id)
}

export const isMissingCreditCardsTableError = (message: string | undefined) => {
  if (!message) return false
  const normalized = message.toLowerCase()
  if (!normalized.includes('credit_cards')) return false
  return (
    normalized.includes("could not find the table 'public.credit_cards' in the schema cache") ||
    normalized.includes('schema cache') ||
    normalized.includes('relation "public.credit_cards" does not exist') ||
    normalized.includes('relation "credit_cards" does not exist') ||
    normalized.includes('does not exist')
  )
}
