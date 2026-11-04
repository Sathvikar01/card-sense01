/** Public configuration, read once. Expo inlines EXPO_PUBLIC_* at build time. */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? '').replace(/\/$/, '')

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
