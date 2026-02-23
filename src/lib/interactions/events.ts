export const INTERACTION_EVENTS = [
  'auth_login_success',
  'auth_signup_success',
  'profile_updated',
  'user_card_added',
  'user_card_removed',
  'recommendation_requested',
  'recommendation_generated',
  'compare_started',
  'compare_completed',
  'advisor_started',
  'advisor_submitted',
  'onboarding_opened',
  'onboarding_completed',
  'onboarding_skipped',
] as const

export type InteractionEventType = (typeof INTERACTION_EVENTS)[number]

export const isInteractionEventType = (value: string): value is InteractionEventType =>
  INTERACTION_EVENTS.includes(value as InteractionEventType)

export interface InteractionPayload {
  page?: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
  sessionId?: string
  occurredAt?: string
}
