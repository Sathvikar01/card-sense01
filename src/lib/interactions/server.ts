import type { Json } from '@/types/database'
import type { createClient as createServerClient } from '@/lib/supabase/server'
import type { InteractionEventType } from '@/lib/interactions/events'

const REDACTED_KEYS = /password|token|secret|key|email|phone|full_name|name|pan|aadhaar|address/i

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const sanitizePrimitive = (value: unknown): Json => {
  if (value === null) return null
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value
  }
  return String(value)
}

const sanitizeValue = (value: unknown): Json => {
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeValue(item))
  }

  if (isPlainObject(value)) {
    return sanitizeInteractionMetadata(value)
  }

  return sanitizePrimitive(value)
}

export const sanitizeInteractionMetadata = (metadata: Record<string, unknown>): Record<string, Json> => {
  const output: Record<string, Json> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (REDACTED_KEYS.test(key)) continue
    output[key] = sanitizeValue(value)
  }
  return output
}

interface InsertInteractionParams {
  supabase: Awaited<ReturnType<typeof createServerClient>>
  userId: string
  eventType: InteractionEventType
  page?: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  sessionId?: string
  occurredAt?: string
}

export async function insertUserInteraction(params: InsertInteractionParams) {
  const {
    supabase,
    userId,
    eventType,
    page,
    entityType,
    entityId,
    metadata,
    sessionId,
    occurredAt,
  } = params

  const payload = {
    user_id: userId,
    event_type: eventType,
    page: page || null,
    entity_type: entityType || null,
    entity_id: entityId || null,
    metadata: metadata ? sanitizeInteractionMetadata(metadata) : {},
    session_id: sessionId || null,
    occurred_at: occurredAt || new Date().toISOString(),
  }

  const { error } = await supabase.from('user_interactions').insert(payload)
  if (error) {
    // Non-blocking interaction logging.
    console.warn('interaction-log error:', error.message)
  }
}
