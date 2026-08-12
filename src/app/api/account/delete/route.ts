import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const RECENT_LOGIN_WINDOW_MS = 15 * 60 * 1000

const isSameOriginRequest = (request: NextRequest) => {
  const origin = request.headers.get('origin')
  if (!origin) return process.env.NODE_ENV === 'development'

  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  const expectedOrigin = configuredOrigin ? new URL(configuredOrigin).origin : request.nextUrl.origin
  return origin === expectedOrigin
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lastSignInAt = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0
  if (!lastSignInAt || Date.now() - lastSignInAt > RECENT_LOGIN_WINDOW_MS) {
    return NextResponse.json(
      { error: 'Please sign in again before deleting your account.', code: 'reauth_required' },
      { status: 403 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Account deletion is not configured' }, { status: 503 })
  }

  // Use service role key to delete user from auth (requires admin privileges)
  const adminClient = createAdminClient(
    supabaseUrl,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await adminClient.auth.admin.deleteUser(user.id)

  if (error) {
    return NextResponse.json({ error: 'Unable to delete account' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
