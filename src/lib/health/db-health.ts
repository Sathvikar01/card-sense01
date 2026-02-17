import { createPublicServerClient } from '@/lib/supabase/public-server'

const REQUIRED_TABLES = [
  'profiles',
  'credit_cards',
  'recommendations',
  'spending_transactions',
  'credit_score_history',
  'uploaded_documents',
  'education_articles',
] as const

type RequiredTable = (typeof REQUIRED_TABLES)[number]

type DbHealthStatus = {
  checkedAt: string
  missingTables: RequiredTable[]
}

const CACHE_TTL_MS = 5 * 60 * 1000
let cachedStatus: { loadedAt: number; value: DbHealthStatus } | null = null

const isMissingTableError = (message: string | undefined, tableName: string) => {
  if (!message) return false
  const normalized = message.toLowerCase()
  return (
    normalized.includes(`public.${tableName}`) &&
    (normalized.includes('schema cache') || normalized.includes('does not exist'))
  )
}

const checkTableExists = async (
  table: RequiredTable,
  supabase: ReturnType<typeof createPublicServerClient>
) => {
  const { error } = await supabase
    .from(table)
    .select('id', { head: true, count: 'exact' })

  if (!error) {
    return true
  }
  if (isMissingTableError(error.message, table)) {
    return false
  }
  // For RLS/auth errors, table exists from schema perspective.
  return true
}

export async function getDbHealthStatus(): Promise<DbHealthStatus> {
  const now = Date.now()
  if (cachedStatus && now - cachedStatus.loadedAt < CACHE_TTL_MS) {
    return cachedStatus.value
  }

  const supabase = createPublicServerClient()
  const checks = await Promise.all(
    REQUIRED_TABLES.map(async (table) => ({
      table,
      exists: await checkTableExists(table, supabase),
    }))
  )

  const value: DbHealthStatus = {
    checkedAt: new Date().toISOString(),
    missingTables: checks.filter((check) => !check.exists).map((check) => check.table),
  }

  cachedStatus = {
    loadedAt: now,
    value,
  }

  return value
}
