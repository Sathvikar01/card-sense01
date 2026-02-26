const SUPABASE_AUTH_OUTAGE_MESSAGE =
  'Supabase auth is unreachable from your network right now. If you are in India and see Cloudflare 525, try DNS 1.1.1.1 or 8.8.8.8, or use another network/VPN.'

const CONNECTIVITY_RETRIES = 2

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const checkAuthSettings = async (supabaseUrl: string, anonKey: string) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)

  try {
    return await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
      },
      cache: 'no-store',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function ensureSupabaseAuthReachable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return {
      ok: false as const,
      message: 'Authentication is temporarily misconfigured. Please try again later.',
    }
  }

  for (let attempt = 0; attempt <= CONNECTIVITY_RETRIES; attempt += 1) {
    try {
      const response = await checkAuthSettings(supabaseUrl, anonKey)
      if (response.ok) {
        return { ok: true as const }
      }

      const isRetryable = response.status >= 500
      const isLastAttempt = attempt === CONNECTIVITY_RETRIES
      if (!isRetryable || isLastAttempt) {
        return {
          ok: false as const,
          message: SUPABASE_AUTH_OUTAGE_MESSAGE,
        }
      }
    } catch {
      const isLastAttempt = attempt === CONNECTIVITY_RETRIES
      if (isLastAttempt) {
        return {
          ok: false as const,
          message: SUPABASE_AUTH_OUTAGE_MESSAGE,
        }
      }
    }

    await sleep(250 * (attempt + 1))
  }

  return {
    ok: false as const,
    message: SUPABASE_AUTH_OUTAGE_MESSAGE,
  }
}
