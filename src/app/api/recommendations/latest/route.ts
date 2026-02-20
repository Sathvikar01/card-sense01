import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/recommendations/latest – Returns the most recent recommendation for the user.
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

    // Try multiple column name variants that saveRecommendation might have used
    type RecommendationRow = {
      id: string
      recommended_cards: unknown
      ai_analysis_text?: string
      ai_analysis?: string
      input_snapshot?: unknown
      input_data?: unknown
      created_at: string
    }

    const queries = [
      supabase
        .from('recommendations')
        .select('id, recommended_cards, ai_analysis_text, input_snapshot, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('recommendations')
        .select('id, recommended_cards, ai_analysis, input_snapshot, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('recommendations')
        .select('id, recommended_cards, ai_analysis, input_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]

    let row: RecommendationRow | null = null
    for (const query of queries) {
      const { data, error } = await query
      if (!error && data) {
        row = data as RecommendationRow
        break
      }
    }

    if (!row) {
      return NextResponse.json({ recommendation: null })
    }

    const cards = Array.isArray(row.recommended_cards) ? row.recommended_cards : []
    const analysis = (row.ai_analysis_text || row.ai_analysis || '') as string

    return NextResponse.json({
      recommendation: {
        id: row.id,
        cards,
        analysis,
        createdAt: row.created_at,
      },
    })
  } catch (error) {
    console.error('GET /api/recommendations/latest error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/recommendations/latest – Clears the user's most recent recommendation (start over).
export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Find the latest recommendation id
    const { data: latest } = await supabase
      .from('recommendations')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!latest?.id) {
      return NextResponse.json({ success: true })
    }

    await supabase.from('recommendations').delete().eq('id', latest.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/recommendations/latest error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
