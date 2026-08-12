import { default as nextDynamic } from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { getProfileWithFallback } from '@/lib/profile/profile-compat'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { DashboardTopPicks, type DashboardTopPick } from '@/components/dashboard/dashboard-top-picks'
import { formatCurrency } from '@/lib/utils/format-currency'
import { getCibilScoreRating, getLatestRecordedCreditScore } from '@/lib/credit-score'
import { getCreditScoreHistoryWithFallback } from '@/lib/profile/profile-compat'

export const dynamic = 'force-dynamic'

interface DashboardProfile {
  id: string
  full_name: string | null
  credit_score: number | null
  updated_at: string | null
  existing_cards_count: number
}

interface SpendingRow {
  amount: number
  transaction_date: string
  category: string | null
}

interface UserCardSummary {
  id: string
  card_name: string
  bank_name: string
}

interface DashboardRecommendation {
  id: string
  input_snapshot: Record<string, unknown>
  recommended_cards: DashboardTopPick[]
  created_at: string
}

function normalizeDashboardCards(value: unknown): DashboardTopPick[] {
  const container = value && typeof value === 'object' ? value as Record<string, unknown> : null
  const rawCards = Array.isArray(value)
    ? value
    : Array.isArray(container?.cards)
      ? container.cards
      : Array.isArray(container?.recommendations)
        ? container.recommendations
        : []

  return rawCards.flatMap((rawCard, index) => {
    if (!rawCard || typeof rawCard !== 'object') return []
    const card = rawCard as Record<string, unknown>
    const cardName = String(card.cardName ?? card.card_name ?? card.name ?? '').trim()
    if (!cardName) return []

    return [{
      cardId: String(card.cardId ?? card.card_id ?? card.id ?? `recommendation-${index}`),
      cardName,
      bank: String(card.bank ?? card.bankName ?? card.bank_name ?? '').trim(),
      score: Number.isFinite(Number(card.score)) ? Number(card.score) : undefined,
    }]
  })
}

async function getDashboardRecommendations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<DashboardRecommendation[]> {
  const queries = [
    supabase
      .from('recommendations')
      .select('id, input_snapshot, recommended_cards, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('recommendations')
      .select('id, input_data, recommended_cards, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
  ]

  for (const query of queries) {
    const { data, error } = await query
    if (error || !data) continue

    return (data as unknown as Array<Record<string, unknown>>)
      .map((row) => ({
        id: String(row.id || ''),
        input_snapshot: (row.input_snapshot || row.input_data || {}) as Record<string, unknown>,
        recommended_cards: normalizeDashboardCards(row.recommended_cards),
        created_at: String(row.created_at || ''),
      }))
      .filter((recommendation) => recommendation.recommended_cards.length > 0)
  }

  return []
}

const SpendingSummaryChart = nextDynamic(
  () =>
    import('@/components/dashboard/spending-summary-chart').then((m) => ({
      default: m.SpendingSummaryChart,
    })),
  {
    loading: () => (
      <div className="dash-card p-6">
        <div className="h-[300px] shimmer rounded-xl" />
      </div>
    ),
  }
)

const CardsOwnedStack = nextDynamic(
  () =>
    import('@/components/dashboard/cards-owned-stack').then((m) => ({
      default: m.CardsOwnedStack,
    })),
  {
    loading: () => (
      <div className="dash-card p-6">
        <div className="h-40 shimmer rounded-xl" />
      </div>
    ),
  }
)

async function getDashboardData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      profile: null,
      recommendations: [],
      cibilHistory: [],
      monthlySpending: [],
      currentMonthTotal: 0,
      totalCards: 0,
      userCards: [],
    }
  }

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const sixMonthsAgoDate = sixMonthsAgo.toISOString().split('T')[0]

  const [profileResult, recommendations, cibilHistory, spendingResult, userCardsResult] = await Promise.all([
    getProfileWithFallback(supabase, { userId: user.id, email: user.email ?? null }),
    getDashboardRecommendations(supabase, user.id),
    getCreditScoreHistoryWithFallback(supabase, user.id),
    supabase
      .from('spending_transactions')
      .select('amount, transaction_date, category')
      .eq('user_id', user.id)
      .gte('transaction_date', sixMonthsAgoDate)
      .order('transaction_date', { ascending: true }),
    supabase
      .from('user_cards')
      .select('id, card_name, bank_name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('added_at', { ascending: false })
      .limit(10),
  ])

  const profile = profileResult as DashboardProfile
  const spendingData = spendingResult.data as SpendingRow[] | null

  // Monthly spending for current month total
  const currentMonth = new Date()
  const monthKey = (value: string) => value.slice(0, 7)
  const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
  const monthlyTotals = new Map<string, number>()
  spendingData?.forEach((transaction) => {
    const key = monthKey(transaction.transaction_date)
    monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + Number(transaction.amount))
  })
  const latestTrackedMonth = [...monthlyTotals.keys()].sort().at(-1)
  const trackedMonthKey = monthlyTotals.has(currentMonthKey) ? currentMonthKey : latestTrackedMonth
  const currentMonthTotal = trackedMonthKey ? monthlyTotals.get(trackedMonthKey) || 0 : 0

  const latestInput = (recommendations?.[0]?.input_snapshot || {}) as Record<string, unknown>
  const snapshotBreakdown =
    latestInput.spendingBreakdown && typeof latestInput.spendingBreakdown === 'object'
      ? (latestInput.spendingBreakdown as Record<string, unknown>)
      : {}
  const snapshotSpendFromCategories = Object.values(snapshotBreakdown).reduce(
    (sum: number, value) => sum + (Number(value) || 0),
    0
  )
  const snapshotMonthlySpend =
    Number(latestInput.monthlySpending || latestInput.monthlySpendEstimate) || snapshotSpendFromCategories
  const dashboardMonthlyTotal = currentMonthTotal > 0 ? currentMonthTotal : snapshotMonthlySpend

  // Category percentage breakdown for chart
  const categoryAmounts: Record<string, number> = {}
  spendingData?.forEach((transaction) => {
    const cat = transaction.category || 'other'
    categoryAmounts[cat] = (categoryAmounts[cat] || 0) + Number(transaction.amount)
  })
  const categoryTotal = Object.values(categoryAmounts).reduce((sum, amt) => sum + amt, 0)
  const categoryData = Object.entries(categoryAmounts)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: categoryTotal > 0 ? Math.round((amount / categoryTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  const snapshotCategoryData = Object.entries(snapshotBreakdown)
    .map(([category, value]) => ({ category, amount: Number(value) || 0 }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
  const chartDataSource = categoryData.length > 0 ? categoryData : snapshotCategoryData
  const chartTotal = chartDataSource.reduce((sum, item) => sum + item.amount, 0)
  const dashboardSpending = chartDataSource.map((item) => ({
    ...item,
    percentage: chartTotal > 0 ? Math.round((item.amount / chartTotal) * 100) : 0,
  }))

  const totalCards = (userCardsResult.data as UserCardSummary[] | null)?.length ?? profile?.existing_cards_count ?? 0
  const userCards = (userCardsResult.data as UserCardSummary[] | null) ?? []

  return {
    profile,
    recommendations,
    cibilHistory,
    monthlySpending: dashboardSpending,
    currentMonthTotal: dashboardMonthlyTotal,
    totalCards,
    userCards,
  }
}

export default async function DashboardPage() {
  const { profile, recommendations, cibilHistory, monthlySpending, currentMonthTotal, userCards } =
    await getDashboardData()

  const cibilScore = getLatestRecordedCreditScore(cibilHistory, profile?.credit_score)
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const topCards = recommendations[0]?.recommended_cards.slice(0, 3) || []

  const greeting = 'Welcome back'

  return (
    <div className="space-y-8">
      {/* ====== Welcome Hero ====== */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4a017]/20 bg-gradient-to-br from-[#fdf3d7]/80 via-white to-[#fdf3d7]/40 p-8 pb-8 sm:p-10">
        <div className="relative z-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b8860b]/70">
            {greeting}
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your personalized credit card command center. Keep your profile fresh for sharper recommendations.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/advisor"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#b8860b]/25 transition-[color,background-color,border-color,opacity,box-shadow,transform,width] hover:shadow-[#b8860b]/35 hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v6m0 0v6m0-6h6m-6 0H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              New Recommendation
            </a>
          </div>
        </div>
      </div>

      {/* ====== Bento Stats Grid ====== */}
      <div className="grid gap-4 border-y border-border/60 py-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* CIBIL Score */}
        <div className="px-1 py-2 lg:border-r lg:border-border/50 lg:pr-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">CIBIL Score</p>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#b8860b]"><path d="M8 1L2 3.5v4c0 3.5 2.6 6.3 6 7.5 3.4-1.2 6-4 6-7.5v-4L8 1z" stroke="currentColor" strokeWidth="1.3" fill="none" /><path d="M5.5 8L7 9.5 10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          {cibilScore ? (
            <div className="mt-3">
              <p className="text-3xl font-bold text-foreground">{cibilScore}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-[width] duration-700"
                  style={{ width: `${Math.min(((cibilScore - 300) / 600) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[0.65rem] text-muted-foreground">
                {getCibilScoreRating(cibilScore)}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Not recorded</p>
              <a href="/profile" className="mt-1 inline-block text-xs font-medium text-[#b8860b] hover:text-[#d4a017]">
                Add your score
              </a>
            </div>
          )}
        </div>

        {/* Monthly Spend */}
        <div className="px-1 py-2 lg:border-r lg:border-border/50 lg:pr-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Monthly Spend</p>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#b8860b]"><rect x="1" y="3" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none" /><path d="M1 6h14" stroke="currentColor" strokeWidth="1.3" /><circle cx="12" cy="9.5" r="1" fill="currentColor" /><path d="M4 3V2a1 1 0 011-1h6a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1" opacity="0.5" /></svg>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(currentMonthTotal)}
            </p>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">Current calendar month</p>
          </div>
        </div>

        {/* Cards Owned */}
        <CardsOwnedStack cards={userCards} />

        {/* Top Picks */}
        <DashboardTopPicks cards={topCards} />
      </div>

      {/* ====== Quick Actions ====== */}
      <QuickActions />

      {/* ====== Main Content ====== */}
      <SpendingSummaryChart data={monthlySpending} />
    </div>
  )
}
