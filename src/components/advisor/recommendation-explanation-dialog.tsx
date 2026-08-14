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

function scoreTone(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-lime-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-500'
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
        <AccordionTrigger className="w-auto py-0 text-xs font-semibold text-primary hover:text-foreground hover:no-underline">
          {triggerLabel}
        </AccordionTrigger>
        <AccordionContent className="w-full pt-4">
          <div className="max-w-2xl space-y-5 border-l border-border pl-4">
            {(card.whyThisCard?.summary || card.finalDecisionReason) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">The short version</p>
                {card.whyThisCard?.summary && <p className="mt-2 text-sm leading-6 text-foreground/80">{card.whyThisCard.summary}</p>}
                {card.finalDecisionReason && <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.finalDecisionReason}</p>}
              </div>
            )}

            {scoreRows.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fit by signal</p>
                  <span className="text-xs text-muted-foreground">{Math.round(Number(card.score) || 0)}/100 overall</span>
                </div>
                <div className="mt-4 space-y-3">
                  {scoreRows.map((row) => {
                    const value = Math.max(0, Math.min(100, row.value))
                    return (
                      <div key={row.id}>
                        <div className="mb-1 flex items-center justify-between gap-4 text-xs">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className={cn('font-semibold tabular-nums', scoreTone(value))}>{Math.round(value)}</span>
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
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Top factors</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/75">
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
