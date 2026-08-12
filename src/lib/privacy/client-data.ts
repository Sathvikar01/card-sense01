export const PRIVATE_STORAGE_KEYS = [
  'cardsense-advisor-storage',
  'beginner-flow-storage',
  'cardsense-preferences',
] as const

export function readPrivateClientData() {
  if (typeof window === 'undefined') return {}

  return Object.fromEntries(
    PRIVATE_STORAGE_KEYS.map((key) => [key, window.localStorage.getItem(key)])
  )
}

export function clearPrivateClientData() {
  if (typeof window === 'undefined') return

  for (const key of PRIVATE_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
  }
  window.sessionStorage.removeItem('cardsense-interaction-session-id')
}
