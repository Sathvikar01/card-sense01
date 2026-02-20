import { NextRequest, NextResponse } from 'next/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import {
  getLocalCreditCardById,
  isMissingCreditCardsTableError,
} from '@/lib/cards/local-catalog'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing card ID' }, { status: 400 })
  }

  try {
    const supabase = await createPublicServerClient()
    const { data: card, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (isMissingCreditCardsTableError(error.message)) {
        const localCard = getLocalCreditCardById(id)
        if (!localCard) {
          return NextResponse.json({ error: 'Card not found' }, { status: 404 })
        }
        return NextResponse.json(localCard)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!card) {
      const localCard = getLocalCreditCardById(id)
      if (!localCard) {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 })
      }
      return NextResponse.json(localCard)
    }

    return NextResponse.json(card)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
