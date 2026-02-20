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
  'slice-super-card': { minAge: 18, maxAge: 65 },
  'jupiter-edge-cred-card': { minAge: 18, maxAge: 65 },
  'au-altura': { minAge: 18, maxAge: 65 },
  'onecard': { minAge: 18, maxAge: 60 },
}

interface CardEnrichment {
  card_variant?: CreditCard['card_variant']
  min_cibil_score?: number
  annual_fee_waiver_spend?: number | null
  forex_markup?: number | null
  travel_insurance_cover?: number | null
  purchase_protection_cover?: number | null
  golf_access?: boolean
  concierge_service?: boolean
  movie_benefits?: string | null
  dining_benefits?: string | null
  welcome_benefits?: CreditCard['welcome_benefits']
  milestone_benefits?: CreditCard['milestone_benefits']
  reward_rate_categories?: CreditCard['reward_rate_categories']
  cons?: string[]
}

const CARD_ENRICHMENTS: Record<string, CardEnrichment> = {
  'hdfc-regalia-gold': {
    card_variant: 'gold',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 500000,
    forex_markup: 2,
    travel_insurance_cover: 5000000,
    golf_access: true,
    concierge_service: false,
    dining_benefits: '15% discount at select partner restaurants',
    welcome_benefits: { description: 'Welcome vouchers worth Rs. 2,500 on spending Rs. 15,000 within 90 days', points: 2500 },
    milestone_benefits: { 'annual_spend': { spend_threshold: 500000, benefit: 'Annual fee waiver + flight vouchers', value: 5000 } },
    reward_rate_categories: {
      travel: { rate: 8, unit: 'points_per_100' },
      dining: { rate: 8, unit: 'points_per_100' },
    },
    cons: ['High annual fee for the category', 'Reward rate on non-bonus categories is modest', 'Points value drops for non-travel redemption'],
  },
  'sbi-cashback': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 200000,
    forex_markup: 3.5,
    cons: ['No lounge access', 'Cashback capped at Rs. 5,000/month for offline', 'Annual fee not waived easily'],
    reward_rate_categories: {
      online: { rate: 5, unit: 'percent_cashback' },
      offline: { rate: 1, unit: 'percent_cashback' },
    },
  },
  'icici-amazon-pay': {
    card_variant: 'classic',
    min_cibil_score: 700,
    forex_markup: 3.5,
    cons: ['Best rewards limited to Amazon ecosystem', 'No lounge access', 'No travel or insurance benefits'],
    reward_rate_categories: {
      amazon: { rate: 5, unit: 'percent_cashback' },
      bills_and_dining: { rate: 2, unit: 'percent_cashback' },
      other: { rate: 1, unit: 'percent_cashback' },
    },
    welcome_benefits: { description: 'Rs. 500 Amazon Pay cashback on first transaction' },
  },
  'axis-ace': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 200000,
    forex_markup: 3.5,
    cons: ['Google Pay required for maximum cashback', 'No lounge access', 'Annual fee waiver requires Rs. 2L spend'],
    reward_rate_categories: {
      google_pay_bills: { rate: 5, unit: 'percent_cashback' },
      swiggy_zomato_uber: { rate: 4, unit: 'percent_cashback' },
      other: { rate: 2, unit: 'percent_cashback' },
    },
  },
  'hdfc-millennia': {
    card_variant: 'classic',
    min_cibil_score: 720,
    annual_fee_waiver_spend: 100000,
    forex_markup: 3.5,
    cons: ['Cashback capped at Rs. 1,000/month', 'Lower offline reward rate', 'Annual fee of Rs. 1,000'],
    reward_rate_categories: {
      amazon_flipkart_myntra: { rate: 5, unit: 'percent_cashback' },
      online: { rate: 2.5, unit: 'percent_cashback' },
      offline: { rate: 1, unit: 'percent_cashback' },
    },
    welcome_benefits: { description: 'Rs. 1,000 cashback on spending Rs. 1,000 in first 30 days', cashback: 1000 },
  },
  'sbi-simply-click': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 100000,
    forex_markup: 3.5,
    cons: ['Reward points not valuable for non-partner redemptions', 'Limited offline rewards', 'No lounge access'],
    reward_rate_categories: {
      partner_merchants: { rate: 10, unit: 'points_per_100' },
      online: { rate: 5, unit: 'points_per_100' },
      offline: { rate: 1, unit: 'points_per_100' },
    },
    welcome_benefits: { description: 'Amazon voucher worth Rs. 500 on card activation' },
  },
  'idfc-first-classic': {
    card_variant: 'classic',
    min_cibil_score: 700,
    forex_markup: 0,
    cons: ['Lower overall reward rate vs premium cards', 'No lounge access', 'Points value is moderate'],
    reward_rate_categories: {
      all: { rate: 3, unit: 'points_per_100' },
    },
  },
  'idfc-first-wow': {
    card_variant: 'classic',
    min_cibil_score: 0,
    forex_markup: 3.5,
    cons: ['Credit limit tied to FD amount', 'Lower reward rate', 'No lounge or premium benefits'],
  },
  'amex-membership-rewards': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 150000,
    forex_markup: 3.5,
    dining_benefits: 'Up to 20% discount at select restaurants via Amex Dining Program',
    cons: ['Limited merchant acceptance in India', 'High annual fee', 'No fuel surcharge waiver'],
    reward_rate_categories: {
      all: { rate: 1, unit: 'points_per_100' },
    },
    milestone_benefits: { 'monthly_4txn': { spend_threshold: 6000, benefit: '1,000 bonus MR points on 4 transactions per month', value: 1000 } },
  },
  'kotak-811-dream': {
    card_variant: 'classic',
    min_cibil_score: 0,
    forex_markup: 3.5,
    cons: ['Very low reward rate', 'No lounge access', 'Limited benefits overall'],
  },
  'axis-myzone': {
    card_variant: 'classic',
    min_cibil_score: 700,
    forex_markup: 3.5,
    movie_benefits: 'Buy 1 Get 1 on movie tickets via Paytm (up to Rs. 250 discount)',
    dining_benefits: 'Discounts on Swiggy, Zomato orders',
    cons: ['Low overall reward rate', 'No lounge access', 'Movie benefit capped at Rs. 250/month'],
  },
  'hdfc-diners-club-black': {
    card_variant: 'infinite',
    min_cibil_score: 780,
    annual_fee_waiver_spend: 500000,
    forex_markup: 1.99,
    travel_insurance_cover: 10000000,
    purchase_protection_cover: 500000,
    golf_access: true,
    concierge_service: true,
    dining_benefits: 'Access to exclusive dining experiences and chef table events',
    movie_benefits: 'Complimentary BookMyShow tickets (Buy 1 Get 1)',
    welcome_benefits: { description: 'Welcome vouchers worth Rs. 5,000', points: 5000 },
    milestone_benefits: {
      'spend_8l': { spend_threshold: 800000, benefit: 'Annual memberships (Amazon Prime, Zomato Gold, etc.)', value: 10000 },
      'spend_5l': { spend_threshold: 500000, benefit: 'Annual fee waiver + bonus vouchers', value: 5000 },
    },
    reward_rate_categories: {
      smartbuy_travel: { rate: 33, unit: 'points_per_100' },
      dining: { rate: 10, unit: 'points_per_100' },
      other: { rate: 5, unit: 'points_per_100' },
    },
    cons: ['Very high income requirement (Rs. 18L+)', 'Diners Club acceptance is limited in India', 'High annual fee of Rs. 10,000'],
  },
  'icici-sapphiro': {
    card_variant: 'signature',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 600000,
    forex_markup: 2,
    travel_insurance_cover: 5000000,
    golf_access: true,
    cons: ['High income requirement', 'Annual fee waiver needs Rs. 6L spend', 'Points value varies by redemption type'],
    reward_rate_categories: {
      dining_travel: { rate: 8, unit: 'points_per_100' },
      other: { rate: 4, unit: 'points_per_100' },
    },
  },
  'rbl-shoprite': {
    card_variant: 'classic',
    min_cibil_score: 650,
    forex_markup: 3.5,
    cons: ['Low non-grocery reward rate', 'No lounge access', 'Limited premium benefits'],
    reward_rate_categories: {
      grocery: { rate: 5, unit: 'percent_cashback' },
      other: { rate: 1.25, unit: 'percent_cashback' },
    },
  },
  'indusind-legend': {
    card_variant: 'signature',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 300000,
    forex_markup: 2.5,
    travel_insurance_cover: 3000000,
    concierge_service: true,
    cons: ['Weekend-dependent bonus rewards', 'Priority Pass visits are limited', 'Annual fee of Rs. 2,999'],
    reward_rate_categories: {
      weekend: { rate: 5, unit: 'points_per_100' },
      weekday: { rate: 3, unit: 'points_per_100' },
    },
  },
  'au-lit': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 250000,
    forex_markup: 3.5,
    movie_benefits: 'Buy 1 Get 1 on movie tickets every month',
    cons: ['Limited lounge visits', 'Annual fee of Rs. 1,999', 'Cashback caps on dining category'],
    reward_rate_categories: {
      movies_ott_gaming: { rate: 5, unit: 'percent_cashback' },
      dining_delivery: { rate: 2, unit: 'percent_cashback' },
      other: { rate: 1, unit: 'percent_cashback' },
    },
  },
  'hdfc-indian-oil': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 50000,
    forex_markup: 3.5,
    cons: ['Benefits mostly limited to Indian Oil outlets', 'No lounge access', 'Low non-fuel rewards'],
    reward_rate_categories: {
      indian_oil: { rate: 5, unit: 'percent_cashback' },
      fuel_all: { rate: 1, unit: 'percent_surcharge_waiver' },
    },
    welcome_benefits: { description: '2,100 fuel points on card activation', points: 2100 },
  },
  'icici-coral': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 150000,
    forex_markup: 3.5,
    movie_benefits: 'Buy 1 Get 1 on BookMyShow (up to 4 times per month)',
    dining_benefits: '15% discount at select partner restaurants',
    cons: ['Low base reward rate', 'Limited lounge visits (1/quarter)', 'Annual fee of Rs. 500'],
    reward_rate_categories: {
      all: { rate: 2, unit: 'points_per_100' },
    },
  },
  'yes-first-preferred': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 250000,
    forex_markup: 3.5,
    movie_benefits: 'BookMyShow offers on select days',
    cons: ['Yes Bank acceptance concerns in past', 'Limited international lounge access', 'Annual fee waiver needs Rs. 2.5L spend'],
    reward_rate_categories: {
      travel_dining: { rate: 6, unit: 'points_per_100' },
      other: { rate: 3, unit: 'points_per_100' },
    },
  },
  'sbi-bpcl': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 100000,
    forex_markup: 3.5,
    cons: ['Best rewards limited to BPCL stations', 'No lounge access', 'Moderate income requirements'],
    reward_rate_categories: {
      bpcl_fuel: { rate: 13, unit: 'points_per_100' },
      dining_movies: { rate: 5, unit: 'points_per_100' },
      other: { rate: 1, unit: 'points_per_100' },
    },
  },
  // ── New cards enrichment ─────────────────────────────────────────────
  'hdfc-infinia': {
    card_variant: 'infinite',
    min_cibil_score: 800,
    annual_fee_waiver_spend: 1000000,
    forex_markup: 2,
    travel_insurance_cover: 20000000,
    purchase_protection_cover: 1000000,
    golf_access: true,
    concierge_service: true,
    dining_benefits: 'Access to the fine dining program with complimentary meals at 5-star restaurants',
    welcome_benefits: { description: 'Welcome voucher worth Rs. 10,000 on first transaction', points: 10000 },
    milestone_benefits: {
      'annual_10l': { spend_threshold: 1000000, benefit: 'Annual fee waiver + Club Marriott membership', value: 15000 },
      'annual_8l': { spend_threshold: 800000, benefit: 'Bonus reward points worth Rs. 7,500', value: 7500 },
    },
    reward_rate_categories: {
      smartbuy_travel: { rate: 33, unit: 'points_per_100' },
      dining: { rate: 10, unit: 'points_per_100' },
      other: { rate: 5, unit: 'points_per_100' },
    },
    cons: ['By-invitation-only for most applicants', 'Very high income requirement (Rs. 30L+)', 'High annual fee of Rs. 12,500'],
  },
  'axis-reserve': {
    card_variant: 'infinite',
    min_cibil_score: 800,
    forex_markup: 0,
    travel_insurance_cover: 30000000,
    purchase_protection_cover: 2000000,
    golf_access: true,
    concierge_service: true,
    dining_benefits: 'Exclusive curated dining experiences at Michelin-starred and premium restaurants',
    welcome_benefits: { description: 'Welcome gift pack valued at Rs. 25,000 on first spend', points: 25000 },
    milestone_benefits: {
      'annual_35l': { spend_threshold: 3500000, benefit: 'Annual fee reversal + exclusive luxury experiences', value: 50000 },
    },
    reward_rate_categories: {
      travel_portals: { rate: 15, unit: 'points_per_100' },
      dining_intl: { rate: 10, unit: 'points_per_100' },
      other: { rate: 5, unit: 'points_per_100' },
    },
    cons: ['Extremely high annual fee of Rs. 50,000', 'Income requirement of Rs. 60L+', 'Overkill for moderate spenders'],
  },
  'sbi-elite': {
    card_variant: 'platinum',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 1000000,
    forex_markup: 1.99,
    travel_insurance_cover: 10000000,
    golf_access: true,
    concierge_service: false,
    welcome_benefits: { description: 'Welcome gift of Rs. 5,000 as e-vouchers on first spend of Rs. 5,000', points: 5000 },
    reward_rate_categories: {
      dining_intl: { rate: 10, unit: 'points_per_100' },
      movies: { rate: 10, unit: 'points_per_100' },
      other: { rate: 2, unit: 'points_per_100' },
    },
    cons: ['High annual fee of Rs. 4,999', 'Limited international lounge visits (only 2)', 'Fee waiver needs Rs. 10L annual spend'],
  },
  'icici-emeralde': {
    card_variant: 'world',
    min_cibil_score: 780,
    annual_fee_waiver_spend: 1500000,
    forex_markup: 1.5,
    travel_insurance_cover: 15000000,
    purchase_protection_cover: 700000,
    golf_access: true,
    concierge_service: true,
    dining_benefits: 'Zomato Pro Plus and exclusive chef-curated dining events',
    welcome_benefits: { description: 'Welcome Kit with premium memberships worth Rs. 12,000', points: 12000 },
    reward_rate_categories: {
      international: { rate: 12, unit: 'points_per_100' },
      domestic_travel: { rate: 6, unit: 'points_per_100' },
      other: { rate: 6, unit: 'points_per_100' },
    },
    cons: ['Very high income requirement (Rs. 24L+)', 'Annual fee of Rs. 12,000', 'Not easily available without ICICI relationship'],
  },
  'axis-atlas': {
    card_variant: 'world',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 750000,
    forex_markup: 0,
    travel_insurance_cover: 5000000,
    concierge_service: false,
    welcome_benefits: { description: '5,000 EDGE Miles on first spend within 30 days', points: 5000 },
    reward_rate_categories: {
      travel: { rate: 12, unit: 'points_per_100' },
      dining: { rate: 6, unit: 'points_per_100' },
      other: { rate: 5, unit: 'points_per_100' },
    },
    cons: ['Annual fee of Rs. 5,000', 'Miles transferability limited to select programs', 'Best value only through travel bookings'],
  },
  'hdfc-tata-neu-plus': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 100000,
    forex_markup: 3.5,
    welcome_benefits: { description: 'NeuCoins worth Rs. 500 on first spend of Rs. 500', cashback: 500 },
    reward_rate_categories: {
      tata_brands: { rate: 5, unit: 'percent_cashback' },
      other: { rate: 1.5, unit: 'percent_cashback' },
    },
    cons: ['Best rewards limited to Tata ecosystem', 'RuPay network has limited international acceptance', 'Moderate base reward rate'],
  },
  'hdfc-tata-neu-infinity': {
    card_variant: 'platinum',
    min_cibil_score: 730,
    annual_fee_waiver_spend: 300000,
    forex_markup: 3.5,
    welcome_benefits: { description: 'NeuCoins worth Rs. 1,500 on first spend of Rs. 3,000', cashback: 1500 },
    reward_rate_categories: {
      tata_brands: { rate: 10, unit: 'percent_cashback' },
      emi_spends: { rate: 5, unit: 'percent_cashback' },
      other: { rate: 1.5, unit: 'percent_cashback' },
    },
    cons: ['RuPay network limits international usage', 'Annual fee of Rs. 1,499', 'Premium benefits lag behind Visa/MC cards at same price'],
  },
  'icici-instant-platinum': {
    card_variant: 'platinum',
    min_cibil_score: 0,
    forex_markup: 3.5,
    cons: ['Credit limit tied to FD value', 'Low reward rate', 'No lounge access or premium benefits'],
  },
  'sbi-prime': {
    card_variant: 'platinum',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 300000,
    forex_markup: 2.5,
    travel_insurance_cover: 5000000,
    dining_benefits: 'Complimentary access to Zomato dining program with 20% off at select restaurants',
    welcome_benefits: { description: 'Welcome vouchers worth Rs. 3,000 on spending Rs. 5,000 in 60 days', points: 3000 },
    milestone_benefits: {
      'spend_3l': { spend_threshold: 300000, benefit: 'Annual fee reversal', value: 2999 },
    },
    reward_rate_categories: {
      dining_grocery: { rate: 10, unit: 'points_per_100' },
      movies: { rate: 10, unit: 'points_per_100' },
      other: { rate: 2, unit: 'points_per_100' },
    },
    cons: ['Annual fee of Rs. 2,999', 'International lounge access not included', 'Club Vistara Silver has limited perks'],
  },
  'kotak-white': {
    card_variant: 'signature',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 400000,
    forex_markup: 2.5,
    travel_insurance_cover: 5000000,
    cons: ['Annual fee of Rs. 3,000', 'Limited international lounge access', 'Reward points value is moderate'],
    reward_rate_categories: {
      travel_dining_entertainment: { rate: 8, unit: 'points_per_100' },
      other: { rate: 4, unit: 'points_per_100' },
    },
  },
  'kotak-royale': {
    card_variant: 'signature',
    min_cibil_score: 720,
    annual_fee_waiver_spend: 200000,
    forex_markup: 3.5,
    cons: ['Annual fee of Rs. 1,499', 'Limited domestic lounge visits', 'No international lounge access'],
    reward_rate_categories: {
      dining_travel_intl: { rate: 8, unit: 'points_per_100' },
      other: { rate: 4, unit: 'points_per_100' },
    },
  },
  'axis-flipkart': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 200000,
    forex_markup: 3.5,
    welcome_benefits: { description: 'Flipkart voucher worth Rs. 500 on approval', cashback: 500 },
    reward_rate_categories: {
      flipkart_cleartrip: { rate: 5, unit: 'percent_cashback' },
      preferred_merchants: { rate: 4, unit: 'percent_cashback' },
      other: { rate: 1.5, unit: 'percent_cashback' },
    },
    cons: ['Best rewards limited to Flipkart ecosystem', 'Annual fee of Rs. 500', 'Cashback is credited as statement credit'],
  },
  'hdfc-biz-moneyback': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 50000,
    forex_markup: 3.5,
    welcome_benefits: { description: 'Rs. 500 CashPoints on first spend of Rs. 500', cashback: 500 },
    reward_rate_categories: {
      amazon_bigbasket_flipkart: { rate: 5, unit: 'points_per_100' },
      other: { rate: 2, unit: 'points_per_100' },
    },
    cons: ['CashPoints expire in 2 years', 'No lounge access', 'Low fee waiver threshold but low rewards too'],
  },
  'amex-plat-travel': {
    card_variant: 'platinum',
    min_cibil_score: 720,
    annual_fee_waiver_spend: null,
    forex_markup: 3.5,
    travel_insurance_cover: 30000000,
    welcome_benefits: { description: 'Taj voucher or Marriott e-gift card worth Rs. 4,000 on first spend', points: 4000 },
    reward_rate_categories: {
      all: { rate: 4, unit: 'points_per_100' },
      indigo_vistara: { rate: 8, unit: 'points_per_100' },
    },
    cons: ['Limited merchant acceptance for Amex in India', 'No fuel surcharge waiver', 'Annual fee of Rs. 5,000 not easily waived'],
  },
  'amex-gold-charge': {
    card_variant: 'gold',
    min_cibil_score: 720,
    annual_fee_waiver_spend: 600000,
    forex_markup: 3.5,
    dining_benefits: 'Premium dining privileges at selected 5-star restaurants through Amex Dining Program',
    reward_rate_categories: {
      all: { rate: 5, unit: 'points_per_100' },
    },
    milestone_benefits: { 'monthly_bonus': { spend_threshold: 6000, benefit: '1,000 bonus MR points on 4 transactions of Rs. 1,500+ per month', value: 1000 } },
    cons: ['Limited merchant acceptance in India', 'No fuel surcharge waiver', 'Points never expire but Amex acceptance is limited'],
  },
  'indusind-pinnacle': {
    card_variant: 'infinite',
    min_cibil_score: 800,
    forex_markup: 0,
    travel_insurance_cover: 50000000,
    purchase_protection_cover: 2500000,
    golf_access: true,
    concierge_service: true,
    dining_benefits: 'Bespoke dining at Michelin-starred restaurants and private chef arrangements',
    welcome_benefits: { description: 'Welcome kit valued at Rs. 50,000 with luxury brand vouchers', points: 50000 },
    milestone_benefits: {
      'annual_50l': { spend_threshold: 5000000, benefit: 'Private jet charter credits + luxury hotel stays', value: 100000 },
    },
    reward_rate_categories: {
      all: { rate: 20, unit: 'points_per_100' },
    },
    cons: ['Extremely high annual fee of Rs. 50,000', 'Income requirement of Rs. 50L+', 'Overkill for most consumers'],
  },
  'rbl-world-safari': {
    card_variant: 'world',
    min_cibil_score: 730,
    annual_fee_waiver_spend: 300000,
    forex_markup: 2,
    travel_insurance_cover: 5000000,
    reward_rate_categories: {
      travel: { rate: 6, unit: 'points_per_100' },
      other: { rate: 2, unit: 'points_per_100' },
    },
    cons: ['Annual fee of Rs. 3,000', 'RBL has smaller branch network', 'Non-travel rewards are low'],
  },
  'idfc-first-wealth': {
    card_variant: 'signature',
    min_cibil_score: 750,
    forex_markup: 0,
    travel_insurance_cover: 10000000,
    concierge_service: true,
    welcome_benefits: { description: 'Welcome kit with premium memberships and vouchers', points: 5000 },
    reward_rate_categories: {
      travel: { rate: 10, unit: 'points_per_100' },
      dining_online: { rate: 5, unit: 'points_per_100' },
      other: { rate: 3, unit: 'points_per_100' },
    },
    cons: ['Requires IDFC FIRST relationship with high balance', 'Must maintain NRV for lifetime free status', 'Not available to all applicants'],
  },
  'federalbank-celesta': {
    card_variant: 'world',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 500000,
    forex_markup: 2,
    travel_insurance_cover: 10000000,
    golf_access: true,
    reward_rate_categories: {
      dining_travel: { rate: 10, unit: 'points_per_100' },
      other: { rate: 5, unit: 'points_per_100' },
    },
    cons: ['High annual fee of Rs. 7,500', 'Federal Bank has limited branch network', 'Less brand recognition than top-tier cards'],
  },
  'yes-marquee': {
    card_variant: 'world',
    min_cibil_score: 780,
    annual_fee_waiver_spend: 1000000,
    forex_markup: 1.75,
    travel_insurance_cover: 15000000,
    golf_access: true,
    concierge_service: true,
    welcome_benefits: { description: 'Annual membership benefits package worth Rs. 15,000', points: 15000 },
    reward_rate_categories: {
      travel_dining: { rate: 24, unit: 'points_per_100' },
      other: { rate: 12, unit: 'points_per_100' },
    },
    cons: ['Very high annual fee of Rs. 9,999', 'Yes Bank had stability concerns', 'Fee waiver needs Rs. 10L spend'],
  },
  'au-altura': {
    card_variant: 'classic',
    min_cibil_score: 650,
    forex_markup: 3.5,
    cons: ['Low overall reward rate', 'AU Small Finance has limited ATM/branch network', 'No lounge access', 'Limited premium features'],
  },
  'au-zenith': {
    card_variant: 'signature',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 800000,
    forex_markup: 1.5,
    travel_insurance_cover: 30000000,
    concierge_service: true,
    welcome_benefits: { description: 'Welcome vouchers worth Rs. 10,000 on first spend of Rs. 10,000', points: 10000 },
    reward_rate_categories: {
      dining_travel_intl: { rate: 20, unit: 'points_per_100' },
      other: { rate: 5, unit: 'points_per_100' },
    },
    cons: ['High annual fee of Rs. 7,999', 'AU Small Finance has limited network', 'Fee waiver requires Rs. 8L spend'],
  },
  'hdfc-rupay-biz': {
    card_variant: 'classic',
    min_cibil_score: 700,
    forex_markup: 3.5,
    cons: ['RuPay has no international acceptance', 'Low base reward rate', 'No lounge access', 'Limited to business-category benefits'],
    reward_rate_categories: {
      telecom_supplies: { rate: 5, unit: 'percent_cashback' },
      other: { rate: 2, unit: 'percent_cashback' },
    },
  },
  'sbi-cashback-plus': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 100000,
    forex_markup: 3.5,
    welcome_benefits: { description: 'Bonus 2,000 activation points on first Rs. 2,000 spend', points: 2000 },
    reward_rate_categories: {
      dining_grocery_movies: { rate: 10, unit: 'points_per_100' },
      other: { rate: 1, unit: 'points_per_100' },
    },
    cons: ['Low non-category reward rate', 'No lounge access', 'Annual fee of Rs. 499'],
  },
  'icici-rubyx': {
    card_variant: 'signature',
    min_cibil_score: 740,
    annual_fee_waiver_spend: 500000,
    forex_markup: 2.5,
    travel_insurance_cover: 3000000,
    movie_benefits: 'Buy 1 Get 1 on BookMyShow every month',
    dining_benefits: '5x rewards on weekday dining across all restaurants',
    welcome_benefits: { description: 'Vouchers worth Rs. 5,000 on spending Rs. 50,000 in 60 days', points: 5000 },
    reward_rate_categories: {
      weekday_dining: { rate: 5, unit: 'points_per_100' },
      other: { rate: 3, unit: 'points_per_100' },
    },
    cons: ['Annual fee of Rs. 3,000', 'Dining rewards only on weekdays', 'Fee waiver needs Rs. 5L spend'],
  },
  'axis-magnus': {
    card_variant: 'signature',
    min_cibil_score: 780,
    annual_fee_waiver_spend: 1500000,
    forex_markup: 0,
    travel_insurance_cover: 10000000,
    golf_access: true,
    concierge_service: true,
    welcome_benefits: { description: 'Welcome benefit of 12,500 EDGE Miles on first spend', points: 12500 },
    milestone_benefits: {
      'annual_15l': { spend_threshold: 1500000, benefit: 'Annual fee reversal + bonus 25,000 miles', value: 25000 },
    },
    reward_rate_categories: {
      travel_portals: { rate: 25, unit: 'points_per_100' },
      other: { rate: 12, unit: 'points_per_100' },
    },
    cons: ['Very high annual fee of Rs. 12,500', 'Income requirement of Rs. 20L+', 'Max value is unlocked only via transfer partners'],
  },
  'hdfc-swiggy': {
    card_variant: 'classic',
    min_cibil_score: 700,
    annual_fee_waiver_spend: 200000,
    forex_markup: 3.5,
    reward_rate_categories: {
      swiggy: { rate: 10, unit: 'percent_cashback' },
      ott: { rate: 5, unit: 'percent_cashback' },
      other: { rate: 1, unit: 'percent_cashback' },
    },
    cons: ['Best rewards limited to Swiggy platform', 'No lounge access', 'No fuel surcharge waiver'],
  },
  'onecard': {
    card_variant: 'classic',
    min_cibil_score: 700,
    forex_markup: 2,
    cons: ['No lounge access', 'Cannot choose reward categories manually', 'App-only management (no branch support)'],
    reward_rate_categories: {
      top_2_categories: { rate: 5, unit: 'points_per_100' },
      other: { rate: 1, unit: 'points_per_100' },
    },
  },
  'slice-super-card': {
    card_variant: 'classic',
    min_cibil_score: 0,
    forex_markup: 3.5,
    cons: ['Low credit limit for new users', 'No lounge access or premium perks', 'EMI charges apply after billing cycle'],
  },
  'jupiter-edge-cred-card': {
    card_variant: 'classic',
    min_cibil_score: 0,
    forex_markup: 3.5,
    cons: ['Very low reward rate of 1%', 'No lounge access', 'No fuel surcharge waiver', 'Limited app ecosystem compared to banks'],
  },
  'hdfc-regalia': {
    card_variant: 'signature',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 300000,
    forex_markup: 2,
    travel_insurance_cover: 5000000,
    golf_access: false,
    concierge_service: false,
    dining_benefits: 'Dine out privileges at select partner restaurants with up to 15% off',
    welcome_benefits: { description: 'Welcome vouchers worth Rs. 2,000 on first spend', points: 2000 },
    reward_rate_categories: {
      dining_travel: { rate: 8, unit: 'points_per_100' },
      other: { rate: 4, unit: 'points_per_100' },
    },
    cons: ['Annual fee of Rs. 2,500', 'Being phased out in favor of Regalia Gold', 'Limited Priority Pass visits (2 international)'],
  },
  'idfc-first-select': {
    card_variant: 'signature',
    min_cibil_score: 720,
    forex_markup: 0,
    cons: ['Must maintain IDFC account for lifetime free', 'Limited lounge visits (4 domestic)', 'No concierge service'],
    reward_rate_categories: {
      online: { rate: 6, unit: 'points_per_100' },
      offline: { rate: 3, unit: 'points_per_100' },
    },
  },
  'sbi-air-india-signature': {
    card_variant: 'platinum',
    min_cibil_score: 720,
    annual_fee_waiver_spend: 200000,
    forex_markup: 3.5,
    travel_insurance_cover: 3000000,
    reward_rate_categories: {
      air_india: { rate: 15, unit: 'points_per_100' },
      sbi_merchants: { rate: 5, unit: 'points_per_100' },
      other: { rate: 2, unit: 'points_per_100' },
    },
    cons: ['Miles value only with Air India flights', 'Limited airline partnerships', 'No fuel surcharge waiver'],
  },
  'axis-vistara-infinite': {
    card_variant: 'infinite',
    min_cibil_score: 780,
    annual_fee_waiver_spend: null,
    forex_markup: 2,
    travel_insurance_cover: 10000000,
    concierge_service: true,
    welcome_benefits: { description: 'Complimentary Business Class domestic ticket on activation', points: 15000 },
    milestone_benefits: {
      'annual_15l': { spend_threshold: 1500000, benefit: 'Complimentary Business Class ticket + renewal fee waiver', value: 20000 },
    },
    reward_rate_categories: {
      vistara: { rate: 10, unit: 'points_per_100' },
      other: { rate: 6, unit: 'points_per_100' },
    },
    cons: ['Very high annual fee of Rs. 10,000', 'Vistara merged with Air India (program transition)', 'Club Vistara Gold perks may change'],
  },
  'sbi-miles-elite': {
    card_variant: 'world',
    min_cibil_score: 750,
    annual_fee_waiver_spend: 500000,
    forex_markup: 1.99,
    travel_insurance_cover: 10000000,
    welcome_benefits: { description: 'Welcome miles worth Rs. 5,000 on first transaction', points: 5000 },
    reward_rate_categories: {
      international_travel: { rate: 20, unit: 'points_per_100' },
      other: { rate: 5, unit: 'points_per_100' },
    },
    cons: ['Annual fee of Rs. 4,999', 'Miles have limited transfer partners in India', 'Non-travel redemptions offer poor value'],
  },
}

const now = new Date().toISOString()

const mapLegacyCardToCreditCard = (card: LegacyCreditCard): CreditCard => {
  const minIncome = card.minIncomeRequired > 0 ? card.minIncomeRequired : null
  const hasLoungeAccess = Boolean(card.loungeAccess)
  const ageRule = CARD_AGE_RULES[card.id] ?? { minAge: 21, maxAge: 65 }
  const enrichment = CARD_ENRICHMENTS[card.id]

  return {
    id: card.id,
    bank_name: toBankName(card.issuer),
    card_name: card.name,
    card_network: toAppCardNetwork(card.network),
    card_type: toAppCardType(card.type),
    card_variant: enrichment?.card_variant ?? 'classic',
    image_url: null,
    joining_fee: card.joiningFee,
    annual_fee: card.annualFee,
    annual_fee_waiver_spend: enrichment?.annual_fee_waiver_spend ?? null,
    renewal_fee: card.annualFee,
    min_income_salaried: minIncome,
    min_income_self_employed: minIncome,
    min_cibil_score: enrichment?.min_cibil_score ?? 700,
    min_age: ageRule.minAge,
    max_age: ageRule.maxAge,
    requires_itr: false,
    requires_existing_relationship: false,
    reward_rate_default: card.rewardRate,
    reward_rate_categories: enrichment?.reward_rate_categories ?? {},
    welcome_benefits: enrichment?.welcome_benefits ?? null,
    milestone_benefits: enrichment?.milestone_benefits ?? null,
    lounge_access: hasLoungeAccess ? 'domestic_only' : 'none',
    lounge_visits_per_quarter: hasLoungeAccess ? 1 : 0,
    fuel_surcharge_waiver: card.fuelSurchargeWaiver,
    fuel_surcharge_waiver_cap: null,
    movie_benefits: enrichment?.movie_benefits ?? null,
    dining_benefits: enrichment?.dining_benefits ?? null,
    travel_insurance_cover: enrichment?.travel_insurance_cover ?? null,
    purchase_protection_cover: enrichment?.purchase_protection_cover ?? null,
    golf_access: enrichment?.golf_access ?? false,
    concierge_service: enrichment?.concierge_service ?? false,
    forex_markup: enrichment?.forex_markup ?? null,
    emi_conversion_available: true,
    description: card.rewardDescription,
    pros: card.benefits.slice(0, 4),
    cons: enrichment?.cons ?? [],
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
