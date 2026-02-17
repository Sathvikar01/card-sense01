import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const PERFORMANCE_LOGS_ENABLED = process.env.PERF_LOGS === '1'

export async function GET(request: Request) {
  const startedAt = Date.now()

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
      .from('spending_transactions')
      .select('id, amount, category, merchant_name, transaction_date, description, card_used')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })

    if (from) {
      query = query.gte('transaction_date', from)
    }
    if (to) {
      query = query.lte('transaction_date', to)
    }

    const { data: transactions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate aggregates
    const totalByCategory: Record<string, number> = {}
    let totalSpend = 0

    transactions?.forEach(txn => {
      totalSpend += Number(txn.amount)
      totalByCategory[txn.category] = (totalByCategory[txn.category] || 0) + Number(txn.amount)
    })

    const responsePayload = {
      transactions,
      aggregates: {
        total: totalSpend,
        by_category: totalByCategory,
        count: transactions?.length || 0
      }
    }

    if (PERFORMANCE_LOGS_ENABLED) {
      const payloadBytes = Buffer.byteLength(JSON.stringify(responsePayload), 'utf8')
      const durationMs = Date.now() - startedAt
      console.info(
        `[perf] /api/spending duration_ms=${durationMs} payload_bytes=${payloadBytes} result_count=${transactions?.length || 0}`
      )
    }

    const response = NextResponse.json(responsePayload)
    response.headers.set('Cache-Control', 'private, no-store')
    return response

  } catch (error) {
    console.error('Spending API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, category, merchant_name, transaction_date, description, card_used } = body

    const { data, error } = await supabase
      .from('spending_transactions')
      .insert({
        user_id: user.id,
        amount,
        category,
        merchant_name,
        transaction_date,
        description,
        card_used,
        source: 'manual'
      })
      .select('id, amount, category, merchant_name, transaction_date, description, card_used')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transaction: data })

  } catch (error) {
    console.error('Spending POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('spending_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Spending DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
