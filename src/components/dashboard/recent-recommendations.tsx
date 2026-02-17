'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import type { Recommendation } from '@/types/recommendation'

interface RecentRecommendationsProps {
  recommendations: Recommendation[]
}

export function RecentRecommendations({ recommendations }: RecentRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recent Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Sparkles className="mb-4 h-14 w-14 text-muted-foreground/35" />
            <p className="text-sm font-medium">No recommendations yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Start with beginner flow to generate your first shortlist.</p>
            <Link href="/beginner">
              <Button className="mt-4 gap-2">
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
        return 'bg-secondary text-foreground'
      case 'experienced':
        return 'bg-accent/65 text-foreground'
      case 'chat':
        return 'bg-muted text-foreground'
      default:
        return 'bg-muted text-foreground'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Recent Recommendations
        </CardTitle>
        <Link href="/recommendations">
          <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/85">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentThree.map((recommendation) => {
            const topCard = recommendation.recommended_cards[0]
            const createdDate = new Date(recommendation.created_at)

            return (
              <Link
                key={recommendation.id}
                href={`/recommendations/${recommendation.id}`}
                className="group block"
              >
                <div className="rounded-2xl border border-border/75 bg-background/70 p-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-border group-hover:shadow-lg group-hover:shadow-black/5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getFlowTypeClass(recommendation.recommendation_type)} variant="secondary">
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
                    <ArrowRight className="h-4 w-4 text-muted-foreground/65 transition-transform group-hover:translate-x-0.5" />
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
                          <p className="text-lg font-bold text-primary">{topCard.score}</p>
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
            )
          })}
        </div>

        {recommendations.length > 3 && (
          <Link href="/recommendations">
            <Button variant="outline" className="mt-4 w-full gap-2">
              View All Recommendations
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
