import { NextRequest, NextResponse } from 'next/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import {
  getLocalCreditCardByIdentifier,
  isUuid,
  isMissingCreditCardsTableError,
} from '@/lib/cards/local-catalog'
import { normalizeRewardRate } from '@/lib/cards/reward-rate'

export const runtime = 'nodejs'

const TRANSIENT_CARD_ERROR_MARKERS = [
  'fetch failed',
  'network',
  'timeout',
  'econnreset',
  'econnrefused',
  'ssl',
  'handshake',
  'cloudflare',
  '525',
]

const isTransientCardError = (message: string | undefined) => {
  if (!message) return false
  const normalized = message.toLowerCase()
  return TRANSIENT_CARD_ERROR_MARKERS.some((marker) => normalized.includes(marker))
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = decodeURIComponent(rawId)

  if (!id) {
    return NextResponse.json({ error: 'Missing card ID' }, { status: 400 })
  }

  try {
    const localCard = getLocalCreditCardByIdentifier(id)
    if (localCard && !isUuid(id)) {
      return NextResponse.json(normalizeRewardRate(localCard))
    }

    const supabase = await createPublicServerClient()
    const byIdQuery = supabase.from('credit_cards').select('*').eq('is_active', true)

    const { data: card, error } = isUuid(id)
      ? await byIdQuery.eq('id', id).maybeSingle()
      : await byIdQuery.ilike('card_name', id).limit(1).maybeSingle()

    if (error) {
      if (isMissingCreditCardsTableError(error.message) || isTransientCardError(error.message)) {
        if (localCard) {
          return NextResponse.json(normalizeRewardRate(localCard))
        }
        return NextResponse.json({ error: 'Card not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Unable to load this card' }, { status: 500 })
    }

    if (!card) {
      if (localCard) {
        return NextResponse.json(normalizeRewardRate(localCard))
      }
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json(normalizeRewardRate(card))
  } catch {
    const localCard = getLocalCreditCardByIdentifier(id)
    if (localCard) {
      return NextResponse.json(normalizeRewardRate(localCard))
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
