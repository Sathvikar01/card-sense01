import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [profile, spending, scores, recommendations, cards, documents, interactions] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('spending_transactions').select('*').eq('user_id', user.id),
      supabase.from('credit_score_history').select('*').eq('user_id', user.id),
      supabase.from('recommendations').select('*').eq('user_id', user.id),
      supabase.from('user_cards').select('*').eq('user_id', user.id),
      supabase.from('uploaded_documents').select('*').eq('user_id', user.id),
      supabase.from('user_interactions').select('*').eq('user_id', user.id),
    ])

  const failed = [profile, spending, scores, recommendations, cards, documents, interactions]
    .find((result) => result.error)

  if (failed?.error) {
    return NextResponse.json({ error: 'Unable to prepare your data export' }, { status: 500 })
  }

  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email ?? null,
        createdAt: user.created_at,
      },
      profile: profile.data,
      spendingTransactions: spending.data ?? [],
      creditScoreHistory: scores.data ?? [],
      recommendations: recommendations.data ?? [],
      cards: cards.data ?? [],
      uploadedDocuments: documents.data ?? [],
      interactionHistory: interactions.data ?? [],
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="cardsense-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    }
  )
}
