import { useCallback, useEffect, useState } from 'react'
import { isConfigured } from './env'
import { supabase } from './supabase'

/** The catalog row the list needs. Same table and columns as the web's /api/cards. */
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
  joining_fee: number
  annual_fee_waiver_spend: number | null
  lounge_access: string | null
  description: string | null
  pros: string[] | null
  apply_url: string | null
}

const SUMMARY = 'id, card_slug, bank_name, card_name, card_network, annual_fee, best_for'
const DETAIL = `${SUMMARY}, joining_fee, annual_fee_waiver_spend, lounge_access, description, pros, apply_url`

export type Load<T> = { state: 'loading' } | { state: 'error' } | { state: 'ready'; data: T }

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

  return [result, retry] as const
}

const fetchCards = async () => {
  if (!isConfigured) throw new Error('not configured')
  const { data, error } = await supabase().from('credit_cards').select(SUMMARY).order('popularity_score', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as CardSummary[]
}

export function useCards() {
  return useLoad(fetchCards)
}

export function useCard(id: string) {
  const load = useCallback(async () => {
    if (!isConfigured) throw new Error('not configured')
    const { data, error } = await supabase().from('credit_cards').select(DETAIL).eq('id', id).single()
    if (error) throw error
    return data as CardDetail
  }, [id])
  return useLoad(load)
}

export const inr = (value: number) => `₹${Math.max(0, value).toLocaleString('en-IN')}`
export const feeLabel = (fee: number) => (fee > 0 ? `${inr(fee)} a year` : 'No annual fee')
