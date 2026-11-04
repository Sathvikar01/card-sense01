/**
 * Published earn rates (percent back) for the landing-page estimator, taken from each
 * card's reward rules in src/data/cards.ts. Flat cashback cards only, so no point
 * valuations are guessed. Caps and fee waivers are ignored, and the page says so.
 */

export type SpendCategory = 'groceries' | 'dining' | 'online' | 'bills' | 'fuel'

export const SPEND_CATEGORIES: Array<{ value: SpendCategory; label: string }> = [
  { value: 'online', label: 'Online shopping' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'dining', label: 'Food delivery' },
  { value: 'bills', label: 'Bills' },
  { value: 'fuel', label: 'Fuel' },
]

export interface HeroCard {
  id: string
  name: string
  bank: string
  annualFee: number
  rates: Record<SpendCategory, number>
}

export const HERO_CARDS: HeroCard[] = [
  { id: 'sbi-cashback', name: 'Cashback', bank: 'SBI Card', annualFee: 999, rates: { online: 5, groceries: 1, dining: 5, bills: 0, fuel: 0 } },
  { id: 'icici-amazon-pay', name: 'Amazon Pay', bank: 'ICICI Bank', annualFee: 0, rates: { online: 5, groceries: 1, dining: 2, bills: 2, fuel: 2 } },
  { id: 'axis-ace', name: 'ACE', bank: 'Axis Bank', annualFee: 499, rates: { online: 2, groceries: 2, dining: 4, bills: 5, fuel: 0 } },
  { id: 'hdfc-millennia', name: 'Millennia', bank: 'HDFC Bank', annualFee: 1000, rates: { online: 5, groceries: 1, dining: 2.5, bills: 1, fuel: 0 } },
  { id: 'rbl-shoprite', name: 'Shoprite', bank: 'RBL Bank', annualFee: 0, rates: { online: 1.25, groceries: 5, dining: 1.25, bills: 1.25, fuel: 0 } },
  { id: 'hdfc-swiggy', name: 'Swiggy', bank: 'HDFC Bank', annualFee: 500, rates: { online: 1, groceries: 1, dining: 10, bills: 1, fuel: 0 } },
  { id: 'hdfc-indian-oil', name: 'Indian Oil', bank: 'HDFC Bank', annualFee: 500, rates: { online: 0.5, groceries: 0.5, dining: 0.5, bills: 0.5, fuel: 5 } },
  { id: 'au-altura', name: 'Altura', bank: 'AU Bank', annualFee: 0, rates: { online: 1, groceries: 1, dining: 1, bills: 2, fuel: 2 } },
]

/** Cards ranked by what they return in a year on this spend, after the annual fee. */
export function rankCards(category: SpendCategory, monthlySpend: number) {
  return HERO_CARDS.map((card) => ({
    card,
    rate: card.rates[category],
    yearly: Math.round((monthlySpend * 12 * card.rates[category]) / 100 - card.annualFee),
  })).sort((a, b) => b.yearly - a.yearly)
}
