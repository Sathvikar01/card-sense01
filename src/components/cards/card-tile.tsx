import type { CreditCardListItem } from '@/types/credit-card'
import { TrendingUp, Award } from 'lucide-react'
import { CardDetailLink } from './card-detail-link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCardVisual } from './credit-card-visual'

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
    <Card className="group">
      <CardHeader className="space-y-3">
        <div className="flex justify-center pb-1">
          <CreditCardVisual cardId={card.id} size="sm" bankName={card.bank_name} />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{card.bank_name}</p>
            <h3 className="text-base font-semibold text-foreground leading-tight">{card.card_name}</h3>
          </div>
          {card.popularity_score >= 90 && (
            <Badge variant="default" className="rounded-full px-2 py-0.5 text-[0.6rem] uppercase tracking-wide shrink-0">
              Popular
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="w-fit rounded-full border-border/80 bg-background/60 text-[0.65rem]">
          {formatCardType(card.card_type)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Annual Fee</span>
          <span className="font-semibold text-foreground">{formatFee(card.annual_fee)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">{card.reward_rate_default}% base rewards</span>
        </div>

        {card.lounge_access && card.lounge_access !== 'none' && (
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-muted-foreground">Lounge access</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1 pt-1">
          {card.best_for?.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="rounded-full px-2 py-0.5 text-[0.6rem]">
              {tag.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <CardDetailLink cardId={card.id} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </CardDetailLink>
      </CardFooter>
    </Card>
  )
}
