export interface CreditCard {
  id: string
  bank_name: string
  card_name: string
  card_network: 'visa' | 'mastercard' | 'rupay' | 'amex' | 'diners'
  card_type: 'entry_level' | 'cashback' | 'rewards' | 'travel' | 'fuel' | 'premium' | 'super_premium' | 'business' | 'secured'
  card_variant: 'classic' | 'gold' | 'platinum' | 'signature' | 'infinite' | 'world' | 'centurion'
  image_url: string | null
  joining_fee: number
  annual_fee: number
  annual_fee_waiver_spend: number | null
  renewal_fee: number
  min_income_salaried: number | null
  min_income_self_employed: number | null
  min_cibil_score: number
  min_age: number
  max_age: number
  requires_itr: boolean
  requires_existing_relationship: boolean
  reward_rate_default: number
  reward_rate_categories: Record<string, CategoryReward>
  welcome_benefits: WelcomeBenefits | null
  milestone_benefits: MilestoneBenefits | null
  lounge_access: string
  lounge_visits_per_quarter: number
  fuel_surcharge_waiver: boolean
  fuel_surcharge_waiver_cap: number | null
  movie_benefits: string | null
  dining_benefits: string | null
  travel_insurance_cover: number | null
  purchase_protection_cover: number | null
  golf_access: boolean
  concierge_service: boolean
  forex_markup: number | null
  emi_conversion_available: boolean
  description: string | null
  pros: string[]
  cons: string[]
  best_for: string[]
  apply_url: string | null
  is_active: boolean
  popularity_score: number
  created_at: string
  updated_at: string
}

export type CreditCardListItem = Pick<
  CreditCard,
  | 'id'
  | 'bank_name'
  | 'card_name'
  | 'card_type'
  | 'annual_fee'
  | 'reward_rate_default'
  | 'lounge_access'
  | 'best_for'
  | 'popularity_score'
>

export interface CategoryReward {
  rate: number
  unit: 'points_per_100' | 'percent_cashback' | 'percent_surcharge_waiver'
  cap_monthly?: number
}

export interface WelcomeBenefits {
  vouchers?: { brand: string; value: number }[]
  points?: number
  cashback?: number
  description: string
}

export interface MilestoneBenefits {
  [key: string]: {
    spend_threshold: number
    benefit: string
    value: number
  }
}
