'use client'

import type { CreditCardListItem } from '@/types/credit-card'
import { TrendingUp, Award } from 'lucide-react'
import { CardDetailLink } from './card-detail-link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCardVisual } from './credit-card-visual'
import { motion } from 'framer-motion'

interface CardTileProps {
  card: CreditCardListItem
}

export function CardTile({ card }: CardTileProps) {
  const formatCardType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatFee = (fee: number) => {
    if (fee === 0) return 'Free'
    return `Rs. ${fee.toLocaleString('en-IN')}`
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="group overflow-hidden border-white/30 bg-white/50 backdrop-blur-xl transition-shadow duration-300 hover:shadow-xl hover:shadow-violet-500/5">
        <CardHeader className="space-y-4 pb-3">
          <div className="flex justify-center pb-1">
            <CreditCardVisual cardId={card.id} size="sm" bankName={card.bank_name} interactive />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">{card.bank_name}</p>
              <h3 className="text-base font-semibold leading-tight text-foreground">{card.card_name}</h3>
            </div>
            {card.popularity_score >= 90 && (
              <Badge className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-0.5 text-[0.6rem] uppercase tracking-wide text-white border-0 shadow-sm">
                Popular
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-violet-200/50 bg-violet-50/50 text-[0.65rem] text-violet-700">
            {formatCardType(card.card_type)}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Annual Fee</span>
            <span className="font-semibold text-foreground">{formatFee(card.annual_fee)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-50">
              <TrendingUp className="h-3 w-3 text-violet-600" />
            </div>
            <span className="text-muted-foreground">{card.reward_rate_default}% base rewards</span>
          </div>

          {card.lounge_access && card.lounge_access !== 'none' && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-50">
                <Award className="h-3 w-3 text-amber-600" />
              </div>
              <span className="text-muted-foreground">Lounge access</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1 pt-1">
            {card.best_for?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="rounded-full bg-secondary/60 px-2 py-0.5 text-[0.6rem]">
                {tag.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <CardDetailLink cardId={card.id} className="w-full">
            <Button variant="outline" className="w-full rounded-xl border-violet-200/50 bg-violet-50/30 text-violet-700 hover:bg-violet-100/50 hover:text-violet-800">
              View Details
            </Button>
          </CardDetailLink>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
