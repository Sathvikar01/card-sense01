'use client'

import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
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
      <div className="stat-card-premium p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017]">
            <StarIcon />
          </div>
          <h3 className="text-base font-semibold text-foreground">Recent Recommendations</h3>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center pb-4 text-muted-foreground">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fdf3d7]">
            <StarIconLg />
          </div>
          <p className="text-sm font-medium text-foreground">No recommendations yet</p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Start with beginner flow to generate your first shortlist.
          </p>
          <Link href="/beginner">
            <Button className="mt-5 gap-2 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] shadow-lg shadow-[#b8860b]/20">
              Get Your First Recommendation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
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
        return 'bg-[#fdf3d7] text-[#7a5500] border-[#d4a017]/30'
      case 'experienced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
      case 'chat':
        return 'bg-blue-50 text-blue-700 border-blue-200/50'
      default:
        return 'bg-muted text-foreground'
    }
  }

  return (
    <div className="stat-card-premium p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017]">
            <StarIcon />
          </div>
          <h3 className="text-base font-semibold text-foreground">Recent Recommendations</h3>
        </div>
        <Link href="/recommendations">
          <Button variant="ghost" size="sm" className="gap-1 text-[#b8860b] hover:text-[#d4a017] hover:bg-[#fdf3d7]/50">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-5 space-y-3">
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
                <div className="recommendation-card p-4 transition-all duration-300">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-full border text-[0.6rem] ${getFlowTypeClass(recommendation.recommendation_type)}`} variant="secondary">
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
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#b8860b]" />
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
                          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{topCard.reasoning}</p>
                        )}
                      </div>
                      {topCard.score && (
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold text-gradient-primary">{topCard.score}</p>
                          <p className="text-[0.6rem] text-muted-foreground">Match</p>
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
          <Button variant="outline" className="mt-4 w-full gap-2 rounded-xl border-[#d4a017]/30 hover:bg-[#fdf3d7]/50">
            View All Recommendations
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l1.8 4.2L14 6l-3.5 3.4.8 4.6L8 11.8 4.7 14l.8-4.6L2 6l4.2-.8z" fill="white" opacity="0.9" />
    </svg>
  )
}

function StarIconLg() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3l3.2 7.8L27 12l-6.5 6.3 1.5 8.7L16 23.5l-6 3.5 1.5-8.7L5 12l7.8-1.2z" stroke="#b8860b" strokeWidth="1.5" fill="none" opacity="0.7" />
    </svg>
  )
}
