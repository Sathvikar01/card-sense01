import { NextRequest, NextResponse } from 'next/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { toCreditCardListItem } from '@/lib/cards/card-mappers'
import { normalizeRewardRate } from '@/lib/cards/reward-rate'

export const runtime = 'nodejs'

const SUMMARY_FIELDS = [
  'id',
  'bank_name',
  'card_name',
  'card_type',
  'annual_fee',
  'reward_rate_default',
  'description',
  'lounge_access',
  'best_for',
  'popularity_score',
].join(', ')

const PERFORMANCE_LOGS_ENABLED = process.env.PERF_LOGS === '1'
const DEFAULT_LIMIT = 60
const MAX_LIMIT = 200
const normalizeFilter = (value: string | null) => {
  if (!value) return ''

  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized === 'all') {
    return ''
  }

  return value.trim()
}

const parsePositiveInteger = (value: string | null) => {
  if (!value) return undefined

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined
  }

  return parsed
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  const { searchParams } = new URL(request.url)

  const search = normalizeFilter(searchParams.get('search'))
  const bank = normalizeFilter(searchParams.get('bank'))
  const cardType = normalizeFilter(searchParams.get('type'))
  const network = normalizeFilter(searchParams.get('network'))
  const maxFee = parsePositiveInteger(searchParams.get('maxFee'))
  const minIncome = parsePositiveInteger(searchParams.get('minIncome'))
  const sortBy = normalizeFilter(searchParams.get('sortBy')) || 'popularity'
  const fields = normalizeFilter(searchParams.get('fields')) === 'full' ? 'full' : 'summary'
  const limit = Math.min(parsePositiveInteger(searchParams.get('limit')) || DEFAULT_LIMIT, MAX_LIMIT)
  const offset = parsePositiveInteger(searchParams.get('offset')) || 0

  const supabase = createPublicServerClient()
  const selectFields = fields === 'full' ? '*' : SUMMARY_FIELDS

  let cardsQuery = supabase
    .from('credit_cards')
    .select(selectFields)
    .eq('is_active', true)

  if (search) {
    const cleanSearch = search.replace(/[^\p{L}\p{N}\s&.'-]/gu, '').trim().slice(0, 80)
    if (cleanSearch) {
      cardsQuery = cardsQuery.or(
        `card_name.ilike.%${cleanSearch}%,bank_name.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`
      )
    }
  }

  if (bank) {
    cardsQuery = cardsQuery.eq('bank_name', bank)
  }

  if (cardType) {
    cardsQuery = cardsQuery.eq('card_type', cardType)
  }

  if (network) {
    cardsQuery = cardsQuery.eq('card_network', network)
  }

  if (typeof maxFee === 'number') {
    cardsQuery = cardsQuery.lte('annual_fee', maxFee)
  }

  if (typeof minIncome === 'number') {
    cardsQuery = cardsQuery.lte('min_income_salaried', minIncome)
  }

  switch (sortBy) {
    case 'fee_low':
      cardsQuery = cardsQuery.order('annual_fee', { ascending: true }).order('popularity_score', { ascending: false })
      break
    case 'fee_high':
      cardsQuery = cardsQuery.order('annual_fee', { ascending: false }).order('popularity_score', { ascending: false })
      break
    case 'reward_high':
      cardsQuery = cardsQuery.order('reward_rate_default', { ascending: false }).order('popularity_score', { ascending: false })
      break
    case 'name':
      cardsQuery = cardsQuery.order('card_name', { ascending: true })
      break
    case 'popularity':
    default:
      cardsQuery = cardsQuery.order('popularity_score', { ascending: false })
      break
  }

  cardsQuery = cardsQuery.range(offset, offset + limit - 1)

  const { data: cards, error } = await cardsQuery
  if (error) {
    return NextResponse.json({ error: 'Unable to load the canonical card catalog' }, { status: 503 })
  }

  if (!cards || cards.length === 0) {
    const { count: activeCatalogCount, error: activeCatalogCountError } = await supabase
      .from('credit_cards')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (activeCatalogCountError) {
      return NextResponse.json({ error: 'Unable to verify the canonical card catalog' }, { status: 503 })
    }

    if (typeof activeCatalogCount === 'number' && activeCatalogCount === 0) {
      return NextResponse.json({ error: 'The canonical card catalog is empty' }, { status: 503 })
    }
  }

  let total: number | undefined
  if (offset === 0) {
    let countQuery = supabase
      .from('credit_cards')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (search) {
      const cleanSearch = search.replace(/[^\p{L}\p{N}\s&.'-]/gu, '').trim().slice(0, 80)
      if (cleanSearch) {
        countQuery = countQuery.or(
          `card_name.ilike.%${cleanSearch}%,bank_name.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`
        )
      }
    }

    if (bank) {
      countQuery = countQuery.eq('bank_name', bank)
    }

    if (cardType) {
      countQuery = countQuery.eq('card_type', cardType)
    }

    if (network) {
      countQuery = countQuery.eq('card_network', network)
    }

    if (typeof maxFee === 'number') {
      countQuery = countQuery.lte('annual_fee', maxFee)
    }

    if (typeof minIncome === 'number') {
      countQuery = countQuery.lte('min_income_salaried', minIncome)
    }

    const { count } = await countQuery
    if (typeof count === 'number') {
      total = count
    }
  }

  const normalizedCards = (cards || []).map((card) => normalizeRewardRate(card))
  const responsePayload = {
    cards: fields === 'full' ? normalizedCards : normalizedCards.map(toCreditCardListItem),
    meta: {
      total,
      limit,
      offset,
    },
  }

  const response = NextResponse.json(responsePayload)
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')

  if (PERFORMANCE_LOGS_ENABLED) {
    const payloadBytes = Buffer.byteLength(JSON.stringify(responsePayload), 'utf8')
    const durationMs = Date.now() - startedAt
    console.info(
      `[perf] /api/cards duration_ms=${durationMs} payload_bytes=${payloadBytes} result_count=${cards?.length || 0}`
    )
  }

  return response
}
