'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { trackInteraction } from '@/lib/interactions/client'
import { cn } from '@/lib/utils'
import type { SavedAdvisorCard } from '@/lib/store/advisor-store'

type RecommendationExplanationDialogProps = {
  card: SavedAdvisorCard
  rank?: number
  triggerLabel?: string
  triggerClassName?: string
}

type ScoreRow = {
  id: string
  label: string
  value: number
}

function toScoreRows(card: SavedAdvisorCard): ScoreRow[] {
  if (!card.ruleScores) return []

  return [
    { id: 'eligibilityFit', label: 'Eligibility', value: Number(card.ruleScores.eligibilityFit) },
    { id: 'spendFit', label: 'Spend match', value: Number(card.ruleScores.spendFit) },
    { id: 'goalFit', label: 'Goal match', value: Number(card.ruleScores.goalFit) },
    { id: 'feeFit', label: 'Fee comfort', value: Number(card.ruleScores.feeFit) },
    { id: 'diversificationFit', label: 'Portfolio balance', value: Number(card.ruleScores.diversificationFit) },
  ].filter((row) => Number.isFinite(row.value))
}

function hasExplainability(card: SavedAdvisorCard) {
  return Boolean(card.finalDecisionReason || card.whyThisCard?.summary || card.rulesEvaluated?.length || card.ruleScores)
}

export function RecommendationExplanationDialog({
  card,
  rank,
  triggerLabel = 'How we matched it',
  triggerClassName,
}: RecommendationExplanationDialogProps) {
  if (!hasExplainability(card)) return null

  const scoreRows = toScoreRows(card)
  const topRules = [...(card.rulesEvaluated || [])]
    .sort((a, b) => (Number(b.contribution) || 0) - (Number(a.contribution) || 0))
    .slice(0, 3)

  return (
    <Accordion
      type="single"
      collapsible
      className={cn('inline-flex', triggerClassName)}
      onValueChange={(value) => {
        if (!value) return
        void trackInteraction('recommendation_explanation_opened', {
          page: '/advisor',
          entityType: 'recommendation_explanation',
          entityId: card.id,
          metadata: { cardName: card.name, bank: card.bank, rank, finalScore: card.score },
        })
      }}
    >
      <AccordionItem value={`explanation-${card.id}`} className="border-0">
        <AccordionTrigger className="w-auto py-0 text-sm font-normal text-muted-foreground hover:text-foreground hover:no-underline">
          {triggerLabel}
        </AccordionTrigger>
        <AccordionContent className="w-full pt-4">
          <div className="max-w-2xl space-y-5 rounded-xl bg-muted p-4">
            {(card.whyThisCard?.summary || card.finalDecisionReason) && (
              <div>
                {card.whyThisCard?.summary && <p className=" text-sm leading-6 text-foreground/80">{card.whyThisCard.summary}</p>}
                {card.finalDecisionReason && <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.finalDecisionReason}</p>}
              </div>
            )}

            {scoreRows.length > 0 && (
              <div>
                <div className="space-y-3">
                  {scoreRows.map((row) => {
                    const value = Math.max(0, Math.min(100, row.value))
                    return (
                      <div key={row.id}>
                        <div className="mb-1 flex items-center justify-between gap-4 text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="tabular-nums text-foreground">{Math.round(value)}</span>
                        </div>
                        <Progress value={value} className="h-1" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {topRules.length > 0 && (
              <div>
                <ul className="space-y-2 text-sm leading-6 text-foreground/75">
                  {topRules.map((rule, index) => <li key={`${rule.ruleId}-${index}`}><span className="mr-2 text-primary">·</span>{rule.detail || rule.label}</li>)}
                </ul>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
