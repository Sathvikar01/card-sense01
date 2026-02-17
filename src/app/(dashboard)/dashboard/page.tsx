import dynamic from 'next/dynamic'
import { CreditCard, Wallet, BarChart3 } from 'lucide-react'
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
      <Card>
        <CardContent className="p-8">
          <div className="h-40 shimmer rounded-xl" />
        </CardContent>
      </Card>
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
      <Card>
        <CardContent className="p-8">
          <div className="h-[300px] shimmer rounded-xl" />
        </CardContent>
      </Card>
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
      <Card>
        <CardContent className="p-8">
          <div className="h-40 shimmer rounded-xl" />
        </CardContent>
      </Card>
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

const statCardStyles = [
  { gradient: 'from-violet-500/8 to-purple-500/5', iconBg: 'from-violet-500 to-purple-600', iconColor: 'text-white' },
  { gradient: 'from-emerald-500/8 to-green-500/5', iconBg: 'from-emerald-500 to-green-600', iconColor: 'text-white' },
  { gradient: 'from-blue-500/8 to-cyan-500/5', iconBg: 'from-blue-500 to-cyan-600', iconColor: 'text-white' },
]

export default async function DashboardPage() {
  const { profile, recommendations, monthlySpending, currentMonthTotal, totalCards } =
    await getDashboardData()

  const cibilScore = profile?.credit_score || null
  const lastUpdated = profile?.updated_at || null

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
      title: 'Recommendations',
      value: recommendations.length.toString(),
      subtitle: 'AI recommendations',
      icon: BarChart3,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="cardsense-hero-title text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1.5 text-muted-foreground">
          {profile?.full_name
            ? `Welcome back, ${profile.full_name.split(' ')[0]}.`
            : 'Welcome back.'}{' '}
          Here&apos;s your credit card overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* CIBIL Score */}
        <div className="md:col-span-2 lg:col-span-1">
          {cibilScore ? (
            <CibilScoreGauge score={cibilScore} lastUpdated={lastUpdated || undefined} />
          ) : (
            <Card className="overflow-hidden border-white/30 bg-white/50 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CIBIL Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center text-muted-foreground">
                  <p className="mb-2 text-sm">No CIBIL score recorded</p>
                  <a href="/profile" className="text-xs font-medium text-violet-600 underline hover:text-violet-500">
                    Update your score
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stat Cards */}
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          const style = statCardStyles[idx]
          return (
            <Card key={stat.title} className={`overflow-hidden border-white/30 bg-gradient-to-br ${style.gradient} backdrop-blur-xl`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${style.iconBg} shadow-lg`}>
                  <Icon className={`h-4 w-4 ${style.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
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
