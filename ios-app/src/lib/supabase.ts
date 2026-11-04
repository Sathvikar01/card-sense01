import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isConfigured } from './env'

/**
 * One client for the app, created on first use so a missing .env.local shows a message
 * instead of crashing at import. Sessions persist in AsyncStorage (SecureStore caps values at 2 KB).
 */
let client: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (!isConfigured) throw new Error('Supabase is not configured')
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: Platform.OS === 'web' ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
  return client
}

// Refresh tokens only while the app is in the foreground (Supabase's React Native guidance).
if (isConfigured && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase().auth.startAutoRefresh()
    else supabase().auth.stopAutoRefresh()
  })
}
