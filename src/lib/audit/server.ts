import 'server-only'

import { headers } from 'next/headers'
import type { Json } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

const REDACTED_KEYS = /password|token|secret|key|pan|aadhaar|cvv|otp/i

type AuditMetadataInput = Record<string, unknown>

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const sanitizePrimitive = (value: unknown): Json => {
  if (value === null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  return String(value)
}

const sanitizeMetadataValue = (value: unknown): Json => {
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeMetadataValue(item))
  }

  if (isPlainObject(value)) {
    return sanitizeAuditMetadata(value)
  }

  return sanitizePrimitive(value)
}

export const sanitizeAuditMetadata = (
  metadata: AuditMetadataInput = {}
): Record<string, Json> => {
  const output: Record<string, Json> = {}

  for (const [key, value] of Object.entries(metadata)) {
    if (REDACTED_KEYS.test(key)) continue
    output[key] = sanitizeMetadataValue(value)
  }

  return output
}

const getClientIpFromHeaders = (headerStore: Headers): string | null => {
  const forwardedFor = headerStore.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = headerStore.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return null
}

interface InsertAuditLogParams {
  action: string
  metadata?: AuditMetadataInput
  sessionId?: string
  ip?: string | null
}

export async function insertAuditLog(params: InsertAuditLogParams): Promise<void> {
  const action = params.action.trim()
  if (!action) {
    console.warn('audit-log skipped: action is required')
    return
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.warn('audit-log skipped: unauthorized')
    return
  }

  let derivedIp: string | null = params.ip || null
  if (!derivedIp) {
    try {
      const headerStore = await headers()
      derivedIp = getClientIpFromHeaders(headerStore)
    } catch {
      derivedIp = null
    }
  }

  const payload = {
    user_id: user.id,
    action,
    metadata: sanitizeAuditMetadata(params.metadata),
    ip: derivedIp,
    session_id: params.sessionId || null,
  }

  const { error } = await supabase.from('audit_logs').insert(payload)
  if (error) {
    console.warn('audit-log insert failed:', error.message)
  }
}
