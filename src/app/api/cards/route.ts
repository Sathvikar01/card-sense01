import { NextRequest, NextResponse } from 'next/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import {
  LOCAL_CARD_CATALOG,
  isMissingCreditCardsTableError,
  toCreditCardListItem,
} from '@/lib/cards/local-catalog'

export const runtime = 'nodejs'

const SUMMARY_FIELDS = [
  'id',
  'bank_name',
  'card_name',
  'card_type',
  'annual_fee',
  'reward_rate_default',
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

const getFallbackCardsResponse = (params: {
  search: string
  bank: string
  cardType: string
  maxFee: number | undefined
  minIncome: number | undefined
  sortBy: string
  fields: 'summary' | 'full'
  limit: number
  offset: number
}) => {
  const { search, bank, cardType, maxFee, minIncome, sortBy, fields, limit, offset } = params
  const normalizedSearch = search.toLowerCase()
  const normalizedBank = bank.toLowerCase()

  let cards = LOCAL_CARD_CATALOG.filter((card) => card.is_active)

  if (normalizedSearch) {
    cards = cards.filter((card) => {
      const haystack = `${card.card_name} ${card.bank_name} ${card.description || ''}`.toLowerCase()
      return haystack.includes(normalizedSearch)
    })
  }

  if (normalizedBank) {
    cards = cards.filter((card) => card.bank_name.toLowerCase() === normalizedBank)
  }

  if (cardType) {
    cards = cards.filter((card) => card.card_type === cardType)
  }

  if (typeof maxFee === 'number') {
    cards = cards.filter((card) => card.annual_fee <= maxFee)
  }

  if (typeof minIncome === 'number') {
    cards = cards.filter(
      (card) => !card.min_income_salaried || card.min_income_salaried <= minIncome
    )
  }

  switch (sortBy) {
    case 'fee_low':
      cards.sort((a, b) => a.annual_fee - b.annual_fee || b.popularity_score - a.popularity_score)
      break
    case 'fee_high':
      cards.sort((a, b) => b.annual_fee - a.annual_fee || b.popularity_score - a.popularity_score)
      break
    case 'name':
      cards.sort((a, b) => a.card_name.localeCompare(b.card_name))
      break
    case 'popularity':
    default:
      cards.sort((a, b) => b.popularity_score - a.popularity_score)
      break
  }

  const total = cards.length
  const paginated = cards.slice(offset, offset + limit)

  return NextResponse.json({
    cards: fields === 'full' ? paginated : paginated.map(toCreditCardListItem),
    meta: {
      total,
      limit,
      offset,
      source: 'local_fallback',
    },
  })
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  const { searchParams } = new URL(request.url)

  const search = normalizeFilter(searchParams.get('search'))
  const bank = normalizeFilter(searchParams.get('bank'))
  const cardType = normalizeFilter(searchParams.get('type'))
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
    const cleanSearch = search.replace(/[,%]/g, '').trim()
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
    if (isMissingCreditCardsTableError(error.message)) {
      return getFallbackCardsResponse({
        search,
        bank,
        cardType,
        maxFee,
        minIncome,
        sortBy,
        fields,
        limit,
        offset,
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let total: number | undefined
  if (offset === 0) {
    let countQuery = supabase
      .from('credit_cards')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (search) {
      const cleanSearch = search.replace(/[,%]/g, '').trim()
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

  const responsePayload = {
    cards: cards || [],
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
