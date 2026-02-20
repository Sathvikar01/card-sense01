import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const addCardSchema = z.object({
  card_name: z.string().min(1, 'Card name is required').max(200),
  bank_name: z.string().min(1, 'Bank name is required').max(100),
  card_type: z.enum(['credit', 'debit', 'prepaid']).optional().default('credit'),
  last_four_digits: z
    .string()
    .regex(/^\d{4}$/, 'Must be exactly 4 digits')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
})

// GET /api/cards/user - Fetch user's cards
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_cards')
      .select('id, card_name, bank_name, card_type, last_four_digits, is_active, added_at, notes')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('GET /api/cards/user error:', error)
      return NextResponse.json({ cards: [] })
    }

    return NextResponse.json({ cards: data || [] })
  } catch (error) {
    console.error('GET /api/cards/user error:', error)
    return NextResponse.json({ cards: [] })
  }
}

// POST /api/cards/user - Add a new card
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = addCardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { card_name, bank_name, card_type, last_four_digits, notes } = validation.data

    const { data, error } = await supabase
      .from('user_cards')
      .insert({
        user_id: user.id,
        card_name,
        bank_name,
        card_type: card_type || 'credit',
        last_four_digits: last_four_digits || null,
        notes: notes || null,
      })
      .select('id, card_name, bank_name, card_type, last_four_digits, is_active, added_at, notes')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'You have already added this card' },
          { status: 409 }
        )
      }
      console.error('POST /api/cards/user error:', error)
      return NextResponse.json({ message: 'Failed to add card' }, { status: 500 })
    }

    return NextResponse.json({ card: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/cards/user error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/cards/user?id=<card-id> - Remove a card
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const cardId = request.nextUrl.searchParams.get('id')
    if (!cardId) {
      return NextResponse.json({ message: 'Card ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', user.id)

    if (error) {
      console.error('DELETE /api/cards/user error:', error)
      return NextResponse.json({ message: 'Failed to delete card' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Card removed' })
  } catch (error) {
    console.error('DELETE /api/cards/user error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
