// Client-side Supabase client for use in Client Components
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

function getBrowserClient() {
  browserClient ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return browserClient
}

/**
 * Returns a handle that creates the real client on first use. Components can call this
 * while rendering, and prerendering a static page (at build time, or on a preview
 * deployment without Supabase env vars) never needs the URL or key.
 */
export function createClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      const client = getBrowserClient()
      const value = Reflect.get(client, prop, client)
      return typeof value === 'function' ? value.bind(client) : value
    },
  })
}
