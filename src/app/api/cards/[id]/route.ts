import { NextRequest, NextResponse } from 'next/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import {
  getLocalCreditCardByIdentifier,
  isUuid,
  isMissingCreditCardsTableError,
} from '@/lib/cards/local-catalog'

export const runtime = 'nodejs'

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
      return NextResponse.json(localCard)
    }

    const supabase = await createPublicServerClient()
    const byIdQuery = supabase.from('credit_cards').select('*').eq('is_active', true)

    const { data: card, error } = isUuid(id)
      ? await byIdQuery.eq('id', id).maybeSingle()
      : await byIdQuery.ilike('card_name', id).limit(1).maybeSingle()

    if (error) {
      if (isMissingCreditCardsTableError(error.message)) {
        if (localCard) {
          return NextResponse.json(localCard)
        }
        return NextResponse.json({ error: 'Card not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!card) {
      if (localCard) {
        return NextResponse.json(localCard)
      }
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json(card)
  } catch {
    const localCard = getLocalCreditCardByIdentifier(id)
    if (localCard) {
      return NextResponse.json(localCard)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
