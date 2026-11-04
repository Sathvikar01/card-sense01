import { useCallback, useEffect, useState } from 'react'
import { WEB_URL, hasWebsite } from './env'

/**
 * The catalogue comes from the website's public API, so the app shows exactly what the
 * site shows (active cards only, same normalisation) and needs no database keys.
 */
export type CardSummary = {
  id: string
  card_slug: string
  bank_name: string
  card_name: string
  card_network: string | null
  annual_fee: number
  best_for: string[] | null
}

export type CardDetail = CardSummary & {
  joining_fee: number | null
  annual_fee_waiver_spend: number | null
  lounge_access: string | null
  description: string | null
  pros: string[] | null
  apply_url: string | null
  application_url: string | null
}

export type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: T }

async function getJson<T>(path: string): Promise<T> {
  if (!hasWebsite) throw new Error('No website address')
  const response = await fetch(`${WEB_URL}${path}`, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return (await response.json()) as T
}

/** Runs `load` on mount and whenever it changes; `retry` starts it again from "loading". */
function useLoad<T>(load: () => Promise<T>) {
  const [result, setResult] = useState<Load<T>>({ state: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    load()
      .then((data) => current && setResult({ state: 'ready', data }))
      .catch(() => current && setResult({ state: 'error' }))
    return () => {
      current = false
    }
  }, [load, attempt])

  const retry = useCallback(() => {
    setResult({ state: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  /** Reloads without dropping what is on screen, for pull-to-refresh. */
  const refresh = useCallback(async () => {
    try {
      setResult({ state: 'ready', data: await load() })
    } catch {
      // Keep the list that is showing; the next pull tries again.
    }
  }, [load])

  return [result, retry, refresh] as const
}

const fetchCards = async () => (await getJson<{ cards: CardSummary[] }>('/api/cards?limit=200&sortBy=popularity')).cards

export function useCards() {
  return useLoad(fetchCards)
}

export function useCard(id: string) {
  const load = useCallback(() => getJson<CardDetail>(`/api/cards/${encodeURIComponent(id)}`), [id])
  return useLoad(load)
}

export const inr = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`
export const feeLabel = (fee: number) => (fee > 0 ? `${inr(fee)} a year` : 'No annual fee')
