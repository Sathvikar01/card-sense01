import dynamic from 'next/dynamic'
import { CreditCard, Wallet, BarChart3, ArrowUpRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileWithFallback } from '@/lib/profile/profile-compat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="stat-card-premium p-6">
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
      <div className="stat-card-premium p-6">
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
      <div className="stat-card-premium p-6">
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

  const [profileResult, recommendationsResult, spendingResult] = await Promise.all([
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

  const totalCards = profile?.existing_cards_count || 0

  return {
    profile,
    recommendations: (recommendations || []) as Recommendation[],
    monthlySpending: monthlySpendingArray,
    currentMonthTotal,
    totalCards,
  }
}

const statCardConfig = [
  {
    gradient: 'from-violet-500/8 to-purple-500/5',
    iconBg: 'from-violet-500 to-purple-600',
    accent: 'text-violet-600',
  },
  {
    gradient: 'from-emerald-500/8 to-green-500/5',
    iconBg: 'from-emerald-500 to-green-600',
    accent: 'text-emerald-600',
  },
  {
    gradient: 'from-blue-500/8 to-cyan-500/5',
    iconBg: 'from-blue-500 to-cyan-600',
    accent: 'text-blue-600',
  },
]

export default async function DashboardPage() {
  const { profile, recommendations, monthlySpending, currentMonthTotal, totalCards } =
    await getDashboardData()

  const cibilScore = profile?.credit_score || null
  const lastUpdated = profile?.updated_at || null
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  const statCards = [
    {
      title: 'Monthly Spend',
      value: `Rs. ${currentMonthTotal.toLocaleString('en-IN')}`,
      subtitle: 'This month',
      icon: Wallet,
    },
    {
      title: 'Cards Owned',
      value: totalCards.toString(),
      subtitle: 'Active cards',
      icon: CreditCard,
    },
    {
      title: 'AI Recommendations',
      value: recommendations.length.toString(),
      subtitle: 'Personalized picks',
      icon: BarChart3,
    },
  ]

  const greetingHour = new Date().getHours()
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* ====== Welcome Banner ====== */}
      <div className="dashboard-welcome p-8 sm:p-10">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/50">
              {greeting}
            </p>
            <h1 className="cardsense-hero-title mt-1 text-2xl font-bold text-white sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Here&apos;s your credit card overview. Keep your profile updated for sharper recommendations.
            </p>
          </div>
          <a
            href="/beginner"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <Sparkles className="h-4 w-4" />
            New Recommendation
          </a>
        </div>
      </div>

      {/* ====== Stats Grid ====== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CIBIL Score */}
        <div className="md:col-span-2 lg:col-span-1">
          {cibilScore ? (
            <CibilScoreGauge score={cibilScore} lastUpdated={lastUpdated || undefined} />
          ) : (
            <div className="stat-card-premium p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">CIBIL Score</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">No score recorded</p>
                <a
                  href="/profile"
                  className="mt-2 inline-block text-xs font-medium text-violet-600 underline hover:text-violet-500"
                >
                  Update your score
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Stat Cards */}
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          const config = statCardConfig[idx]
          return (
            <div
              key={stat.title}
              className="stat-card-premium p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${config.iconBg} shadow-lg`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ====== Quick Actions ====== */}
      <QuickActions />

      {/* ====== Main Content Grid ====== */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <RecentRecommendations recommendations={recommendations} />
        </div>
        <div>
          <SpendingSummaryChart data={monthlySpending} />
        </div>
      </div>
    </div>
  )
}
