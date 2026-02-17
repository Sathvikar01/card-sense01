import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  getCreditScoreHistoryWithFallback,
  insertCreditScoreWithFallback,
  ProfileCompatError,
  upsertProfileWithFallback,
} from '@/lib/profile/profile-compat'

// GET /api/profile/cibil - Fetch user's CIBIL score history
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const history = await getCreditScoreHistoryWithFallback(supabase, user.id)

    const response = NextResponse.json({ history: history || [] })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (error) {
    console.error('GET /api/profile/cibil error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/profile/cibil - Add new CIBIL score entry
const addScoreSchema = z.object({
  credit_score: z
    .number()
    .int()
    .min(300, 'CIBIL score must be at least 300')
    .max(900, 'CIBIL score must be at most 900'),
  score_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  score_source: z.enum(['cibil', 'experian', 'equifax', 'crif', 'manual']).optional(),
  notes: z.string().max(500).optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = addScoreSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { credit_score, score_date, score_source, notes } = validationResult.data

    const result = await insertCreditScoreWithFallback(supabase, {
      userId: user.id,
      creditScore: credit_score,
      scoreDate: score_date,
      scoreSource: score_source || 'manual',
      notes: notes || null,
    })

    if (result.duplicate) {
      return NextResponse.json(
        { message: 'A score already exists for this date. Please choose a different date.' },
        { status: 409 }
      )
    }

    if (!result.entry) {
      return NextResponse.json(
        { message: 'Failed to add CIBIL score' },
        { status: 500 }
      )
    }
    await upsertProfileWithFallback(supabase, {
      userId: user.id,
      email: user.email ?? null,
      patch: {
        credit_score,
        credit_score_date: score_date,
      },
    })

    return NextResponse.json({
      message: 'CIBIL score added successfully',
      entry: result.entry,
    })
  } catch (error) {
    if (error instanceof ProfileCompatError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
          ...(process.env.NODE_ENV !== 'production' && error.details
            ? { details: error.details }
            : {}),
        },
        { status: error.status }
      )
    }

    console.error('POST /api/profile/cibil error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
