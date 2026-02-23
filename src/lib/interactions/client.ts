'use client'

import type { InteractionEventType, InteractionPayload } from '@/lib/interactions/events'

const SESSION_KEY = 'cardsense_session_id'
const REDACTED_KEYS = /password|token|secret|key|email|phone|full_name|name|pan|aadhaar|address/i

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const getSessionId = () => {
  if (typeof window === 'undefined') return 'server-session'

  const existing = window.sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const id = crypto.randomUUID()
  window.sessionStorage.setItem(SESSION_KEY, id)
  return id
}

const sanitizeValue = (value: unknown): unknown => {
  if (value === null || typeof value === 'boolean' || typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    return value.length > 300 ? `${value.slice(0, 300)}...` : value
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item))
  }
  if (isPlainObject(value)) {
    return sanitizeMetadata(value)
  }
  return String(value)
}

const sanitizeMetadata = (metadata: Record<string, unknown>): Record<string, unknown> => {
  const output: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (REDACTED_KEYS.test(key)) continue
    output[key] = sanitizeValue(value)
  }
  return output
}

interface InteractionRequestEvent {
  eventType: InteractionEventType
  page?: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  sessionId?: string
  occurredAt?: string
}

const postEvents = async (events: InteractionRequestEvent[]) => {
  const payload = JSON.stringify({ events })

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' })
    const accepted = navigator.sendBeacon('/api/interactions', blob)
    if (accepted) return
  }

  await fetch('/api/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  })
}

export async function trackInteraction(
  eventType: InteractionEventType,
  payload: InteractionPayload = {}
) {
  if (typeof window === 'undefined') return

  const event: InteractionRequestEvent = {
    eventType,
    page: payload.page || window.location.pathname,
    entityType: payload.entityType,
    entityId: payload.entityId,
    metadata: payload.metadata ? sanitizeMetadata(payload.metadata) : {},
    sessionId: payload.sessionId || getSessionId(),
    occurredAt: payload.occurredAt,
  }

  try {
    await postEvents([event])
  } catch {
    // Non-blocking telemetry.
  }
}
