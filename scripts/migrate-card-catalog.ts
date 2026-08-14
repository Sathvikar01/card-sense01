/**
 * Import the existing application catalog into public.credit_cards.
 *
 * Run `supabase db push` first so migration 013 has created card_slug, then:
 *   npm run migrate:cards
 *
 * This is intentionally a one-way migration input. Runtime code must read
 * public.credit_cards and must not use this local catalog as a fallback.
 */

import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'
import { LOCAL_CARD_CATALOG } from '@/lib/cards/local-catalog'
import { createAdminClient } from '@/lib/supabase/admin'

const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) config({ path: envPath })

const supabase = createAdminClient()
const verifiedAt = new Date().toISOString()

const rows = LOCAL_CARD_CATALOG.map((card) => ({
  card_slug: card.id,
  bank_name: card.bank_name,
  card_name: card.card_name,
  card_network: card.card_network,
  card_type: card.card_type,
  card_variant: card.card_variant,
  image_url: card.image_url,
  joining_fee: card.joining_fee,
  annual_fee: card.annual_fee,
  annual_fee_waiver_spend: card.annual_fee_waiver_spend,
  renewal_fee: card.renewal_fee,
  min_income_salaried: card.min_income_salaried,
  min_income_self_employed: card.min_income_self_employed,
  min_income_required: card.min_income_salaried,
  min_cibil_score: card.min_cibil_score >= 300 ? card.min_cibil_score : null,
  min_credit_score: card.min_cibil_score >= 300 ? card.min_cibil_score : null,
  min_age: card.min_age,
  max_age: card.max_age,
  requires_itr: card.requires_itr,
  requires_existing_relationship: card.requires_existing_relationship,
  reward_rate_default: card.reward_rate_default,
  reward_rate_categories: card.reward_rate_categories,
  welcome_benefits: card.welcome_benefits,
  milestone_benefits: card.milestone_benefits,
  lounge_access: card.lounge_access,
  lounge_access_details: card.lounge_access_details ?? null,
  lounge_visits_per_quarter: card.lounge_visits_per_quarter,
  fuel_surcharge_waiver: card.fuel_surcharge_waiver,
  fuel_surcharge_waiver_cap: card.fuel_surcharge_waiver_cap,
  movie_benefits: card.movie_benefits,
  dining_benefits: card.dining_benefits,
  travel_insurance_cover: card.travel_insurance_cover,
  purchase_protection_cover: card.purchase_protection_cover,
  golf_access: card.golf_access,
  concierge_service: card.concierge_service,
  forex_markup: card.forex_markup,
  emi_conversion_available: card.emi_conversion_available,
  description: card.description,
  pros: card.pros,
  cons: card.cons,
  best_for: card.best_for,
  apply_url: card.apply_url,
  is_active: card.is_active,
  popularity_score: card.popularity_score,
  data_source: 'catalog_import',
  data_last_verified_at: verifiedAt,
  metadata: {},
}))

async function main() {
  const { error } = await supabase
    .from('credit_cards')
    .upsert(rows as never[], { onConflict: 'card_slug' })

  if (error) {
    throw new Error(`Card catalog import failed: ${error.message}`)
  }

  const { count, error: countError } = await supabase
    .from('credit_cards')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  if (countError) {
    throw new Error(`Card catalog verification failed: ${countError.message}`)
  }

  console.log(`Imported ${rows.length} card records into public.credit_cards.`)
  console.log(`Active canonical cards available to the app: ${count ?? 0}.`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
