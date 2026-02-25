import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { isInteractionEventType } from '@/lib/interactions/events'
import { sanitizeInteractionMetadata } from '@/lib/interactions/server'

const interactionSchema = z.object({
  eventType: z.string().min(2).max(120),
  page: z.string().max(300).optional(),
  entityType: z.string().max(120).optional(),
  entityId: z.string().max(300).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().max(120).optional(),
  occurredAt: z.string().datetime().optional(),
})

const bodySchema = z.union([
  interactionSchema,
  z.object({
    events: z.array(interactionSchema).min(1).max(25),
  }),
])

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid interaction payload', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const events = 'events' in parsed.data ? parsed.data.events : [parsed.data]

    const unknownEventType = events.find((event) => !isInteractionEventType(event.eventType))
    if (unknownEventType) {
      return NextResponse.json(
        { message: `Unsupported event type: ${unknownEventType.eventType}` },
        { status: 400 }
      )
    }

    const rows = events.map((event) => ({
      user_id: user.id,
      event_type: event.eventType,
      page: event.page || request.nextUrl.pathname || null,
      entity_type: event.entityType || null,
      entity_id: event.entityId || null,
      metadata: event.metadata ? sanitizeInteractionMetadata(event.metadata) : {},
      session_id: event.sessionId || null,
      occurred_at: event.occurredAt || new Date().toISOString(),
    }))

    const { error } = await supabase.from('user_interactions').insert(rows)
    if (error) {
      return NextResponse.json({ message: 'Failed to store interactions' }, { status: 500 })
    }

    return NextResponse.json({ success: true, inserted: rows.length })
  } catch (error) {
    console.error('POST /api/interactions error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
