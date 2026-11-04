import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfileWithFallback } from '@/lib/profile/profile-compat'
import { CategoryList } from '@/components/dashboard/category-breakdown'
import { Section } from '@/components/shared/section'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { DashboardTopPicks, type DashboardTopPick } from '@/components/dashboard/dashboard-top-picks'
import { formatCurrency } from '@/lib/utils/format-currency'
import { getLatestRecordedCreditScore } from '@/lib/credit-score'
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
      cardSlug: card.cardSlug ? String(card.cardSlug) : card.card_slug ? String(card.card_slug) : undefined,
      imageUrl: card.imageUrl ? String(card.imageUrl) : card.image_url ? String(card.image_url) : null,
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
  const firstName = profile?.full_name?.split(' ')[0]
  const topCards = recommendations[0]?.recommended_cards.slice(0, 3) || []

  const stats = [
    { label: 'CIBIL score', value: cibilScore ? String(cibilScore) : '—', href: '/profile' },
    { label: 'Cards', value: String(userCards.length), href: '/profile' },
    { label: 'This month', value: formatCurrency(currentMonthTotal, { showDecimals: false }), href: '/spending' },
  ]

  return (
    <div className="flex flex-col gap-12">
      <div>
        <PageHeader title={firstName ? `Hi, ${firstName}` : 'Home'} className="mb-5" />
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="group flex flex-col-reverse">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight transition-opacity group-hover:opacity-70">{stat.value}</dd>
            </Link>
          ))}
        </dl>
      </div>

      <DashboardTopPicks cards={topCards} />

      <Section title="Spending" action={monthlySpending.length ? { label: 'View all', href: '/spending' } : undefined}>
        {monthlySpending.length > 0 ? <CategoryList data={monthlySpending} /> : <EmptyState title="No spending yet" actionLabel="Add spending" actionHref="/spending" />}
      </Section>
    </div>
  )
}
