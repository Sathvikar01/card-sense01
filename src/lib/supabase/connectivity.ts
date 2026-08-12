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

      if (response.status === 401 || response.status === 403) {
        return {
          ok: false as const,
          message: 'Supabase authentication is misconfigured for this deployment. Please refresh the deployment environment variables.',
        }
      }

      const isRetryable = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500
      const isLastAttempt = attempt === CONNECTIVITY_RETRIES
      if (!isRetryable || isLastAttempt) {
        return {
          ok: false as const,
          message: `Supabase authentication could not be reached (HTTP ${response.status}). Please try again shortly.`,
        }
      }
    } catch (error) {
      const isLastAttempt = attempt === CONNECTIVITY_RETRIES
      if (isLastAttempt) {
        const isTimeout = error instanceof DOMException && error.name === 'AbortError'
        return {
          ok: false as const,
          message: isTimeout
            ? 'Supabase authentication timed out while connecting. Please try again shortly.'
            : 'Supabase authentication could not be reached from this network. Please check your connection and try again.',
        }
      }
    }

    await sleep(250 * (attempt + 1))
  }

  return {
    ok: false as const,
    message: 'Supabase authentication could not be reached. Please try again shortly.',
  }
}
