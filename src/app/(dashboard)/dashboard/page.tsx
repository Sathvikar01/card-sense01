import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { getProfileWithFallback } from '@/lib/profile/profile-compat'
import { QuickActions } from '@/components/dashboard/quick-actions'
import type { Recommendation } from '@/types/recommendation'

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
}

const CibilScoreGauge = dynamic(
  () => import('@/components/dashboard/cibil-score-gauge').then((m) => ({ default: m.CibilScoreGauge })),
  {
    loading: () => (
      <div className="dash-card p-6">
        <div className="h-40 shimmer rounded-xl" />
      </div>
    ),
  }
)

const SpendingSummaryChart = dynamic(
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

const RecentRecommendations = dynamic(
  () =>
    import('@/components/dashboard/recent-recommendations').then((m) => ({
      default: m.RecentRecommendations,
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
      monthlySpending: [],
      currentMonthTotal: 0,
      totalCards: 0,
    }
  }

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const sixMonthsAgoDate = sixMonthsAgo.toISOString().split('T')[0]

  const [profileResult, recommendationsResult, spendingResult, userCardsResult] = await Promise.all([
    getProfileWithFallback(supabase, { userId: user.id, email: user.email ?? null }),
    supabase
      .from('recommendations')
      .select(
        'id, user_id, recommendation_type, input_snapshot, recommended_cards, ai_analysis, spending_analysis, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('spending_transactions')
      .select('amount, transaction_date')
      .eq('user_id', user.id)
      .gte('transaction_date', sixMonthsAgoDate)
      .order('transaction_date', { ascending: true }),
    supabase
      .from('user_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true),
  ])

  const profile = profileResult as DashboardProfile
  const recommendations = recommendationsResult.data as Recommendation[] | null
  const spendingData = spendingResult.data as SpendingRow[] | null

  const monthlySpending: Record<string, number> = {}
  spendingData?.forEach((transaction) => {
    const date = new Date(transaction.transaction_date)
    const monthKey = date.toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    })
    monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + Number(transaction.amount)
  })

  const monthlySpendingArray = Object.entries(monthlySpending).map(([month, amount]) => ({
    month,
    amount,
  }))

  const currentMonth = new Date()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const currentMonthTotal =
    spendingData?.reduce((sum, transaction) => {
      if (new Date(transaction.transaction_date) >= firstDayOfMonth) {
        return sum + Number(transaction.amount)
      }
      return sum
    }, 0) || 0

  const totalCards = userCardsResult.count ?? profile?.existing_cards_count ?? 0

  return {
    profile,
    recommendations: (recommendations || []) as Recommendation[],
    monthlySpending: monthlySpendingArray,
    currentMonthTotal,
    totalCards,
  }
}

export default async function DashboardPage() {
  const { profile, recommendations, monthlySpending, currentMonthTotal, totalCards } =
    await getDashboardData()

  const cibilScore = profile?.credit_score || null
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  const greetingHour = new Date().getHours()
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* ====== Welcome Hero ====== */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4a017]/20 bg-gradient-to-br from-[#fdf3d7]/80 via-white to-[#fdf3d7]/40 p-8 sm:p-10">
        {/* Subtle mesh gradient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#d4a017]/8 blur-[80px]" />
          <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-[#e8c04a]/6 blur-[60px]" />
          <div className="absolute right-1/3 top-0 h-40 w-40 rounded-full bg-[#d4a017]/5 blur-[60px]" />
        </div>

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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#b8860b]/25 transition-all hover:shadow-[#b8860b]/35 hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v6m0 0v6m0-6h6m-6 0H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              New Recommendation
            </a>
          </div>
        </div>
      </div>

      {/* ====== Bento Stats Grid ====== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CIBIL Score */}
        <div className="dash-card relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/8 blur-[30px]" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">CIBIL Score</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 3.5v4c0 3.5 2.6 6.3 6 7.5 3.4-1.2 6-4 6-7.5v-4L8 1z" stroke="white" strokeWidth="1.3" fill="none" /><path d="M5.5 8L7 9.5 10.5 6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          {cibilScore ? (
            <div className="mt-3">
              <p className="text-3xl font-bold text-foreground">{cibilScore}</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.min(((cibilScore - 300) / 600) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[0.65rem] text-muted-foreground">
                {cibilScore >= 750 ? 'Excellent' : cibilScore >= 650 ? 'Good' : 'Needs improvement'}
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
        <div className="dash-card relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/8 blur-[30px]" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Monthly Spend</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="11" rx="2" stroke="white" strokeWidth="1.3" fill="none" /><path d="M1 6h14" stroke="white" strokeWidth="1.3" /><circle cx="12" cy="9.5" r="1" fill="white" /><path d="M4 3V2a1 1 0 011-1h6a1 1 0 011 1v1" stroke="white" strokeWidth="1" opacity="0.5" /></svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">
              <span className="text-lg font-medium text-muted-foreground">Rs.</span> {currentMonthTotal.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">Current billing cycle</p>
          </div>
        </div>

        {/* Cards Owned */}
        <div className="dash-card relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/8 blur-[30px]" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Cards Owned</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="8" rx="2" stroke="white" strokeWidth="1.3" fill="none" /><rect x="3" y="3" width="10" height="2" rx="1" fill="white" opacity="0.3" /><rect x="4" y="1" width="8" height="2" rx="1" fill="white" opacity="0.15" /><line x1="2" y1="8" x2="14" y2="8" stroke="white" strokeWidth="1" opacity="0.4" /></svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">{totalCards}</p>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">Active credit cards</p>
          </div>
        </div>

        {/* Top Picks */}
        <div className="dash-card relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/8 blur-[30px]" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Top Picks</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-purple-500">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" stroke="white" strokeWidth="1.3" fill="none" /><path d="M5.5 8L7 9.5 10.5 6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-bold text-foreground">{recommendations.length}</p>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">Personalized recommendations</p>
          </div>
        </div>
      </div>

      {/* ====== Quick Actions ====== */}
      <QuickActions />

      {/* ====== Main Content ====== */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentRecommendations recommendations={recommendations} />
        <SpendingSummaryChart data={monthlySpending} />
      </div>
    </div>
  )
}
