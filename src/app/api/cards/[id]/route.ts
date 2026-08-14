import { NextRequest, NextResponse } from 'next/server'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { isUuid } from '@/lib/cards/card-mappers'
import { normalizeRewardRate } from '@/lib/cards/reward-rate'

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
    const supabase = await createPublicServerClient()
    const createCardQuery = () => supabase.from('credit_cards').select('*').eq('is_active', true)

    const result = isUuid(id)
      ? await createCardQuery().eq('id', id).maybeSingle()
      : await createCardQuery().eq('card_slug', id).maybeSingle()
    const { data: card, error } = !result.error && !result.data && !isUuid(id)
      ? await createCardQuery().ilike('card_name', id).limit(1).maybeSingle()
      : result

    if (error) {
      return NextResponse.json({ error: 'Unable to load the canonical card catalog' }, { status: 503 })
    }

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    return NextResponse.json(normalizeRewardRate(card))
  } catch {
    return NextResponse.json({ error: 'Unable to load the canonical card catalog' }, { status: 503 })
  }
}
