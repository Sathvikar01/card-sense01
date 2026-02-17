import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  getProfileWithFallback,
  ProfileCompatError,
  upsertProfileWithFallback,
} from '@/lib/profile/profile-compat'

// GET /api/profile - Fetch user profile
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

    const profile = await getProfileWithFallback(supabase, {
      userId: user.id,
      email: user.email ?? null,
    })

    const response = NextResponse.json({ profile })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  } catch (error) {
    console.error('GET /api/profile error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional().nullable(),
  city: z.string().min(2).max(100).optional().nullable(),
  employment_type: z.enum(['salaried', 'self_employed', 'student', 'retired', 'unemployed', 'other']).optional().nullable(),
  employer_name: z.string().max(200).optional().nullable(),
  annual_income: z.number().min(0).max(100000000).optional().nullable(),
  primary_bank: z.string().max(100).optional().nullable(),
  has_fixed_deposit: z.boolean().optional(),
  fd_amount: z.number().min(0).max(100000000).optional().nullable(),
})

export async function PUT(request: NextRequest) {
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
    const validationResult = updateProfileSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data
    const updatedProfile = await upsertProfileWithFallback(supabase, {
      userId: user.id,
      email: user.email ?? null,
      patch: updateData,
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
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

    console.error('PUT /api/profile error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
