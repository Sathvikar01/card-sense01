import dynamic from 'next/dynamic'
import { Sparkles, CreditCard } from 'lucide-react'
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
          <div className="h-40 animate-pulse rounded-xl bg-muted/55" />
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
          <div className="h-[300px] animate-pulse rounded-xl bg-muted/55" />
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
          <div className="h-40 animate-pulse rounded-xl bg-muted/55" />
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

export default async function DashboardPage() {
  const { profile, recommendations, monthlySpending, currentMonthTotal, totalCards } =
    await getDashboardData()

  const cibilScore = profile?.credit_score || null
  const lastUpdated = profile?.updated_at || null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          {profile?.full_name
            ? `Welcome back, ${profile.full_name.split(' ')[0]}.`
            : 'Welcome back.'}{' '}
          Here&apos;s your credit card overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-1">
          {cibilScore ? (
            <CibilScoreGauge score={cibilScore} lastUpdated={lastUpdated || undefined} />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CIBIL Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center text-muted-foreground">
                  <p className="mb-2 text-sm">No CIBIL score recorded</p>
                  <a href="/profile" className="text-xs text-primary underline hover:text-primary/85">
                    Update your score
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {currentMonthTotal.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Owned</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
            <p className="text-xs text-muted-foreground">Active cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">AI recommendations</p>
          </CardContent>
        </Card>
      </div>

      <QuickActions />

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
