const SUPABASE_AUTH_OUTAGE_MESSAGE =
  'Supabase auth is unreachable from your network right now. If you are in India and see Cloudflare 525, try DNS 1.1.1.1 or 8.8.8.8, or use another network/VPN.'

export async function ensureSupabaseAuthReachable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return {
      ok: false as const,
      message: 'Authentication is temporarily misconfigured. Please try again later.',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    if (response.ok) {
      return { ok: true as const }
    }

    return {
      ok: false as const,
      message: SUPABASE_AUTH_OUTAGE_MESSAGE,
    }
  } catch {
    return {
      ok: false as const,
      message: SUPABASE_AUTH_OUTAGE_MESSAGE,
    }
  } finally {
    clearTimeout(timeout)
  }
}

