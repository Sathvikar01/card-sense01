/** Public configuration, read once. Expo inlines EXPO_PUBLIC_* at build time. */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? '').replace(/\/$/, '')
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** The catalogue and the website links need only the website's address. */
export const hasWebsite = Boolean(WEB_URL)
/** Signing in needs the Supabase project the website uses. */
export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
