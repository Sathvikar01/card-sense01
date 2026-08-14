import type { CreditCard, CreditCardListItem } from '@/types/credit-card'

export const toCreditCardListItem = (card: CreditCard): CreditCardListItem => ({
  id: card.id,
  card_slug: card.card_slug,
  bank_name: card.bank_name,
  card_name: card.card_name,
  card_network: card.card_network,
  card_variant: card.card_variant,
  image_url: card.image_url,
  card_type: card.card_type,
  annual_fee: card.annual_fee,
  reward_rate_default: card.reward_rate_default,
  lounge_access: card.lounge_access,
  best_for: card.best_for,
  popularity_score: card.popularity_score,
})

export const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  )
