'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { motion } from 'framer-motion'
import type { Recommendation } from '@/types/recommendation'

interface RecentRecommendationsProps {
  recommendations: Recommendation[]
}

export function RecentRecommendations({ recommendations }: RecentRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="overflow-hidden border-white/30 bg-white/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Recent Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
              <Sparkles className="h-8 w-8 text-violet-300" />
            </div>
            <p className="text-sm font-medium">No recommendations yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Start with beginner flow to generate your first shortlist.</p>
            <Link href="/beginner">
              <Button className="mt-4 gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                Get Your First Recommendation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentThree = recommendations.slice(0, 3)

  const getFlowTypeLabel = (type: string) => {
    switch (type) {
      case 'beginner':
        return 'Beginner Flow'
      case 'experienced':
        return 'Experienced Flow'
      case 'chat':
        return 'AI Advisor'
      default:
        return type
    }
  }

  const getFlowTypeClass = (type: string) => {
    switch (type) {
      case 'beginner':
        return 'bg-violet-50 text-violet-700 border-violet-200/50'
      case 'experienced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
      case 'chat':
        return 'bg-blue-50 text-blue-700 border-blue-200/50'
      default:
        return 'bg-muted text-foreground'
    }
  }

  return (
    <Card className="overflow-hidden border-white/30 bg-white/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Recent Recommendations
        </CardTitle>
        <Link href="/recommendations">
          <Button variant="ghost" size="sm" className="gap-1 text-violet-600 hover:text-violet-500 hover:bg-violet-50/50">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentThree.map((recommendation, idx) => {
            const topCard = recommendation.recommended_cards[0]
            const createdDate = new Date(recommendation.created_at)

            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
              >
                <Link
                  href={`/recommendations/${recommendation.id}`}
                  className="group block"
                >
                  <div className="rounded-2xl border border-white/40 bg-white/40 p-4 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-violet-200/50 group-hover:bg-white/60 group-hover:shadow-lg group-hover:shadow-violet-500/5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`rounded-full border ${getFlowTypeClass(recommendation.recommendation_type)}`} variant="secondary">
                          {getFlowTypeLabel(recommendation.recommendation_type)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {createdDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-violet-500" />
                    </div>

                    {topCard && (
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 pt-0.5">
                          <CreditCardVisual
                            cardId={topCard.cardId || ''}
                            size="sm"
                            bankName={topCard.bank}
                            className="!w-16"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{topCard.cardName}</p>
                          <p className="mb-2 text-xs text-muted-foreground">{topCard.bank}</p>
                          {topCard.reasoning && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">{topCard.reasoning}</p>
                          )}
                        </div>
                        {topCard.score && (
                          <div className="shrink-0 text-right">
                            <p className="text-lg font-bold text-gradient-primary">{topCard.score}</p>
                            <p className="text-xs text-muted-foreground">Match</p>
                          </div>
                        )}
                      </div>
                    )}

                    {recommendation.recommended_cards.length > 1 && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        +{recommendation.recommended_cards.length - 1} more card
                        {recommendation.recommended_cards.length - 1 !== 1 ? 's' : ''} recommended
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {recommendations.length > 3 && (
          <Link href="/recommendations">
            <Button variant="outline" className="mt-4 w-full gap-2 rounded-xl border-violet-200/50 hover:bg-violet-50/50">
              View All Recommendations
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
