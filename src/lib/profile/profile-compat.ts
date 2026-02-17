import type { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

type ProfileClient = Awaited<ReturnType<typeof createClient>>

type UnknownRow = Record<string, unknown>

type ProfileCompatErrorCode = 'DB_SETUP_INCOMPLETE' | 'SCHEMA_MISMATCH' | 'PROFILE_UPDATE_FAILED'

export class ProfileCompatError extends Error {
  readonly status: number
  readonly code: ProfileCompatErrorCode
  readonly details: string | null

  constructor(params: {
    message: string
    status: number
    code: ProfileCompatErrorCode
    details?: string | null
  }) {
    super(params.message)
    this.name = 'ProfileCompatError'
    this.status = params.status
    this.code = params.code
    this.details = params.details ?? null
  }
}

export interface NormalizedProfile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  city: string | null
  annual_income: number | null
  employment_type: string | null
  employer_name: string | null
  primary_bank: string | null
  has_fixed_deposit: boolean | null
  fd_amount: number | null
  credit_score: number | null
  credit_score_date: string | null
  existing_cards_count: number
  created_at: string
  updated_at: string
}

export interface NormalizedCreditScoreHistory {
  id: string
  credit_score: number
  score_date: string
  score_source: string | null
  notes: string | null
}

export interface NormalizedProfileUpdate {
  full_name?: string | null
  phone?: string | null
  city?: string | null
  annual_income?: number | null
  employment_type?: string | null
  employer_name?: string | null
  primary_bank?: string | null
  has_fixed_deposit?: boolean
  fd_amount?: number | null
  credit_score?: number | null
  credit_score_date?: string | null
}

const MODERN_PROFILE_SELECT = [
  'id',
  'email',
  'full_name',
  'phone',
  'city',
  'annual_income',
  'employment_type',
  'employer_name',
  'primary_bank',
  'has_fixed_deposit',
  'fd_amount',
  'credit_score',
  'credit_score_date',
  'existing_card_ids',
  'created_at',
  'updated_at',
].join(', ')

const LEGACY_PROFILE_SELECT = [
  'id',
  'email',
  'full_name',
  'phone',
  'city',
  'income_range',
  'employment_type',
  'primary_bank',
  'cibil_score',
  'existing_cards',
  'fixed_deposits',
  'created_at',
  'updated_at',
].join(', ')

const MODERN_HISTORY_SELECT = 'id, credit_score, score_date, score_source, notes'
const LEGACY_HISTORY_SELECT = 'id, score, score_date, source, notes'

const asString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value
  }
  return null
}

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

const asBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') {
    return value
  }
  return null
}

const parseIncomeRange = (value: unknown): number | null => {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  const matches = value.match(/\d[\d,]*/g)
  if (!matches || matches.length === 0) {
    return null
  }

  const upperBoundCandidate = matches[matches.length - 1].replace(/,/g, '')
  const parsed = Number(upperBoundCandidate)
  return Number.isFinite(parsed) ? parsed : null
}

const countItems = (value: unknown): number => {
  if (Array.isArray(value)) {
    return value.length
  }
  return 0
}

const parseFixedDeposits = (value: unknown): { hasFixedDeposit: boolean | null; amount: number | null } => {
  if (!Array.isArray(value)) {
    return { hasFixedDeposit: null, amount: null }
  }

  if (value.length === 0) {
    return { hasFixedDeposit: false, amount: null }
  }

  let total = 0
  let hasAmount = false
  for (const item of value) {
    if (typeof item === 'number' && Number.isFinite(item)) {
      total += item
      hasAmount = true
      continue
    }

    if (item && typeof item === 'object') {
      const candidate = item as UnknownRow
      const amount =
        asNumber(candidate.amount) ??
        asNumber(candidate.fd_amount) ??
        asNumber(candidate.value)
      if (typeof amount === 'number') {
        total += amount
        hasAmount = true
      }
    }
  }

  return {
    hasFixedDeposit: true,
    amount: hasAmount ? Math.round(total) : null,
  }
}

const toIsoString = () => new Date().toISOString()

const normalizeModernProfile = (row: UnknownRow): NormalizedProfile => ({
  id: asString(row.id) || '',
  email: asString(row.email),
  full_name: asString(row.full_name),
  phone: asString(row.phone),
  city: asString(row.city),
  annual_income: asNumber(row.annual_income),
  employment_type: asString(row.employment_type),
  employer_name: asString(row.employer_name),
  primary_bank: asString(row.primary_bank),
  has_fixed_deposit: asBoolean(row.has_fixed_deposit),
  fd_amount: asNumber(row.fd_amount),
  credit_score: asNumber(row.credit_score),
  credit_score_date: asString(row.credit_score_date),
  existing_cards_count: countItems(row.existing_card_ids),
  created_at: asString(row.created_at) || toIsoString(),
  updated_at: asString(row.updated_at) || toIsoString(),
})

const normalizeLegacyProfile = (row: UnknownRow): NormalizedProfile => {
  const fixedDeposits = parseFixedDeposits(row.fixed_deposits as Json)
  return {
    id: asString(row.id) || '',
    email: asString(row.email),
    full_name: asString(row.full_name),
    phone: asString(row.phone),
    city: asString(row.city),
    annual_income: parseIncomeRange(row.income_range),
    employment_type: asString(row.employment_type),
    employer_name: null,
    primary_bank: asString(row.primary_bank),
    has_fixed_deposit: fixedDeposits.hasFixedDeposit,
    fd_amount: fixedDeposits.amount,
    credit_score: asNumber(row.cibil_score),
    credit_score_date: null,
    existing_cards_count: countItems(row.existing_cards),
    created_at: asString(row.created_at) || toIsoString(),
    updated_at: asString(row.updated_at) || toIsoString(),
  }
}

const normalizeModernHistory = (row: UnknownRow): NormalizedCreditScoreHistory => ({
  id: asString(row.id) || crypto.randomUUID(),
  credit_score: asNumber(row.credit_score) || 0,
  score_date: asString(row.score_date) || '',
  score_source: asString(row.score_source),
  notes: asString(row.notes),
})

const normalizeLegacyHistory = (row: UnknownRow): NormalizedCreditScoreHistory => ({
  id: asString(row.id) || crypto.randomUUID(),
  credit_score: asNumber(row.score) || 0,
  score_date: asString(row.score_date) || '',
  score_source: asString(row.source),
  notes: asString(row.notes),
})

const buildLegacyIncomeRange = (annualIncome: number | null | undefined) => {
  if (typeof annualIncome !== 'number' || !Number.isFinite(annualIncome) || annualIncome <= 0) {
    return null
  }
  return String(Math.round(annualIncome))
}

const buildLegacyFixedDeposits = (
  hasFixedDeposit: boolean | undefined,
  fdAmount: number | null | undefined
) => {
  if (!hasFixedDeposit) {
    return []
  }
  const amount = typeof fdAmount === 'number' && Number.isFinite(fdAmount) ? Math.max(0, fdAmount) : 0
  return [{ amount: Math.round(amount) }]
}

const isMissingTableError = (message: string | undefined, tableName: string) => {
  if (!message) return false
  const normalized = message.toLowerCase()
  return (
    normalized.includes(`public.${tableName}`) &&
    (normalized.includes('schema cache') || normalized.includes('does not exist'))
  )
}

const isMissingColumnError = (message: string | undefined) => {
  if (!message) return false
  const normalized = message.toLowerCase()
  return normalized.includes('column') && normalized.includes('does not exist')
}

const isSchemaCacheColumnError = (message: string | undefined) => {
  if (!message) return false
  const normalized = message.toLowerCase()
  return normalized.includes('schema cache') && normalized.includes('column')
}

async function ensureProfileExists(
  supabase: ProfileClient,
  params: { userId: string; email: string | null }
) {
  const payloads: UnknownRow[] = [
    {
      id: params.userId,
      email: params.email,
      updated_at: toIsoString(),
    },
    {
      id: params.userId,
      email: params.email,
    },
  ]

  for (const payload of payloads) {
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
    if (!error) {
      return
    }
  }
}

export async function getProfileWithFallback(
  supabase: ProfileClient,
  params: { userId: string; email: string | null }
): Promise<NormalizedProfile> {
  const modern = await supabase
    .from('profiles')
    .select(MODERN_PROFILE_SELECT)
    .eq('id', params.userId)
    .maybeSingle()

  if (modern.data) {
    return normalizeModernProfile(modern.data as unknown as UnknownRow)
  }
  if (isMissingTableError(modern.error?.message, 'profiles')) {
    const now = toIsoString()
    return {
      id: params.userId,
      email: params.email,
      full_name: null,
      phone: null,
      city: null,
      annual_income: null,
      employment_type: null,
      employer_name: null,
      primary_bank: null,
      has_fixed_deposit: null,
      fd_amount: null,
      credit_score: null,
      credit_score_date: null,
      existing_cards_count: 0,
      created_at: now,
      updated_at: now,
    }
  }

  const legacy = await supabase
    .from('profiles')
    .select(LEGACY_PROFILE_SELECT)
    .eq('id', params.userId)
    .maybeSingle()

  if (legacy.data) {
    return normalizeLegacyProfile(legacy.data as unknown as UnknownRow)
  }
  if (isMissingTableError(legacy.error?.message, 'profiles')) {
    const now = toIsoString()
    return {
      id: params.userId,
      email: params.email,
      full_name: null,
      phone: null,
      city: null,
      annual_income: null,
      employment_type: null,
      employer_name: null,
      primary_bank: null,
      has_fixed_deposit: null,
      fd_amount: null,
      credit_score: null,
      credit_score_date: null,
      existing_cards_count: 0,
      created_at: now,
      updated_at: now,
    }
  }

  await ensureProfileExists(supabase, params)

  const retryModern = await supabase
    .from('profiles')
    .select(MODERN_PROFILE_SELECT)
    .eq('id', params.userId)
    .maybeSingle()

  if (retryModern.data) {
    return normalizeModernProfile(retryModern.data as unknown as UnknownRow)
  }

  const retryLegacy = await supabase
    .from('profiles')
    .select(LEGACY_PROFILE_SELECT)
    .eq('id', params.userId)
    .maybeSingle()

  if (retryLegacy.data) {
    return normalizeLegacyProfile(retryLegacy.data as unknown as UnknownRow)
  }

  const now = toIsoString()
  return {
    id: params.userId,
    email: params.email,
    full_name: null,
    phone: null,
    city: null,
    annual_income: null,
    employment_type: null,
    employer_name: null,
    primary_bank: null,
    has_fixed_deposit: null,
    fd_amount: null,
    credit_score: null,
    credit_score_date: null,
    existing_cards_count: 0,
    created_at: now,
    updated_at: now,
  }
}

export async function getCreditScoreHistoryWithFallback(
  supabase: ProfileClient,
  userId: string
): Promise<NormalizedCreditScoreHistory[]> {
  const modern = await supabase
    .from('credit_score_history')
    .select(MODERN_HISTORY_SELECT)
    .eq('user_id', userId)
    .order('score_date', { ascending: false })

  if (!modern.error && modern.data) {
    return (modern.data as unknown as UnknownRow[]).map(normalizeModernHistory)
  }
  if (isMissingTableError(modern.error?.message, 'credit_score_history')) {
    return []
  }

  const legacy = await supabase
    .from('credit_score_history')
    .select(LEGACY_HISTORY_SELECT)
    .eq('user_id', userId)
    .order('score_date', { ascending: false })

  if (!legacy.error && legacy.data) {
    return (legacy.data as unknown as UnknownRow[]).map(normalizeLegacyHistory)
  }
  if (isMissingTableError(legacy.error?.message, 'credit_score_history')) {
    return []
  }

  return []
}

export async function upsertProfileWithFallback(
  supabase: ProfileClient,
  params: {
    userId: string
    email: string | null
    patch: NormalizedProfileUpdate
  }
): Promise<NormalizedProfile> {
  const now = toIsoString()
  await ensureProfileExists(supabase, { userId: params.userId, email: params.email })

  const modernPayload: UnknownRow = {
    id: params.userId,
    updated_at: now,
  }
  if (params.email) {
    modernPayload.email = params.email
  }

  for (const [key, value] of Object.entries(params.patch)) {
    if (typeof value !== 'undefined') {
      modernPayload[key] = value
    }
  }

  let modernSuccess = false
  let modernErrorMessage = ''
  {
    const { error } = await supabase.from('profiles').upsert(modernPayload, { onConflict: 'id' })
    modernSuccess = !error
    modernErrorMessage = error?.message || ''
  }

  let legacySuccess = false
  let legacyErrorMessage = ''
  if (!modernSuccess) {
    const legacyPayload: UnknownRow = {
      id: params.userId,
      updated_at: now,
    }
    if (params.email) {
      legacyPayload.email = params.email
    }

    if (typeof params.patch.full_name !== 'undefined') {
      legacyPayload.full_name = params.patch.full_name
    }
    if (typeof params.patch.phone !== 'undefined') {
      legacyPayload.phone = params.patch.phone
    }
    if (typeof params.patch.city !== 'undefined') {
      legacyPayload.city = params.patch.city
    }
    if (typeof params.patch.employment_type !== 'undefined') {
      legacyPayload.employment_type = params.patch.employment_type
    }
    if (typeof params.patch.primary_bank !== 'undefined') {
      legacyPayload.primary_bank = params.patch.primary_bank
    }
    if (typeof params.patch.annual_income !== 'undefined') {
      legacyPayload.income_range = buildLegacyIncomeRange(params.patch.annual_income)
    }
    if (
      typeof params.patch.has_fixed_deposit !== 'undefined' ||
      typeof params.patch.fd_amount !== 'undefined'
    ) {
      legacyPayload.fixed_deposits = buildLegacyFixedDeposits(
        params.patch.has_fixed_deposit,
        params.patch.fd_amount
      )
    }
    if (typeof params.patch.credit_score !== 'undefined') {
      legacyPayload.cibil_score = params.patch.credit_score
    }

    const { error } = await supabase.from('profiles').upsert(legacyPayload, { onConflict: 'id' })
    legacySuccess = !error
    legacyErrorMessage = error?.message || ''
  }

  if (!modernSuccess && !legacySuccess) {
    const details = `Modern error: ${modernErrorMessage || 'unknown'}; Legacy error: ${legacyErrorMessage || 'unknown'}`
    const hasMissingProfilesTable =
      isMissingTableError(modernErrorMessage, 'profiles') ||
      isMissingTableError(legacyErrorMessage, 'profiles')
    const hasSchemaMismatch =
      isMissingColumnError(modernErrorMessage) || isSchemaCacheColumnError(modernErrorMessage)

    if (hasMissingProfilesTable) {
      throw new ProfileCompatError({
        message:
          'Profile updates are unavailable because the `profiles` table is missing. Run Supabase migrations and retry.',
        status: 503,
        code: 'DB_SETUP_INCOMPLETE',
        details,
      })
    }

    if (hasSchemaMismatch) {
      throw new ProfileCompatError({
        message:
          'Profile updates are unavailable because your database schema is out of sync. Run the latest Supabase migrations and retry.',
        status: 503,
        code: 'SCHEMA_MISMATCH',
        details,
      })
    }

    throw new ProfileCompatError({
      message: 'Failed to update profile due to a database error. Please try again.',
      status: 500,
      code: 'PROFILE_UPDATE_FAILED',
      details,
    })
  }

  return getProfileWithFallback(supabase, {
    userId: params.userId,
    email: params.email,
  })
}

export async function insertCreditScoreWithFallback(
  supabase: ProfileClient,
  params: {
    userId: string
    creditScore: number
    scoreDate: string
    scoreSource: string
    notes: string | null
  }
) {
  const modernDuplicate = await supabase
    .from('credit_score_history')
    .select('id')
    .eq('user_id', params.userId)
    .eq('score_date', params.scoreDate)
    .maybeSingle()

  if (modernDuplicate.data) {
    return { duplicate: true as const, entry: null }
  }

  const legacyDuplicate = await supabase
    .from('credit_score_history')
    .select('id')
    .eq('user_id', params.userId)
    .eq('score_date', params.scoreDate)
    .maybeSingle()

  if (legacyDuplicate.data) {
    return { duplicate: true as const, entry: null }
  }

  const modernInsert = await supabase
    .from('credit_score_history')
    .insert({
      user_id: params.userId,
      credit_score: params.creditScore,
      score_date: params.scoreDate,
      score_source: params.scoreSource,
      notes: params.notes,
    })
    .select(MODERN_HISTORY_SELECT)
    .maybeSingle()

  if (!modernInsert.error && modernInsert.data) {
    return {
      duplicate: false as const,
      entry: normalizeModernHistory(modernInsert.data as unknown as UnknownRow),
    }
  }

  const legacyInsert = await supabase
    .from('credit_score_history')
    .insert({
      user_id: params.userId,
      score: params.creditScore,
      score_date: params.scoreDate,
      source: params.scoreSource,
      notes: params.notes,
    })
    .select(LEGACY_HISTORY_SELECT)
    .maybeSingle()

  if (!legacyInsert.error && legacyInsert.data) {
    return {
      duplicate: false as const,
      entry: normalizeLegacyHistory(legacyInsert.data as unknown as UnknownRow),
    }
  }

  return {
    duplicate: false as const,
    entry: null,
  }
}
