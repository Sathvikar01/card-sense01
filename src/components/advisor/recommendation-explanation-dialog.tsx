'use client'

import { Badge } from '@/components/ui/badge'
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

const RULE_LABELS: Record<string, string> = {
  eligibility_fit: 'Eligibility Fit',
  spend_fit: 'Spend Alignment',
  goal_fit: 'Goal Alignment',
  fee_fit: 'Fee Comfort',
  diversification_fit: 'Portfolio Diversification',
}

function formatPercentWeight(weight: number) {
  return `${Math.round(weight * 100)}%`
}

function scoreTone(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-lime-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-500'
}

function toScoreRows(card: SavedAdvisorCard): ScoreRow[] {
  if (!card.ruleScores) return []

  const rows: ScoreRow[] = [
    { id: 'eligibilityFit', label: 'Eligibility', value: Number(card.ruleScores.eligibilityFit) },
    { id: 'spendFit', label: 'Spend match', value: Number(card.ruleScores.spendFit) },
    { id: 'goalFit', label: 'Goal match', value: Number(card.ruleScores.goalFit) },
    { id: 'feeFit', label: 'Fee comfort', value: Number(card.ruleScores.feeFit) },
    { id: 'diversificationFit', label: 'Portfolio balance', value: Number(card.ruleScores.diversificationFit) },
  ]

  return rows.filter((row) => Number.isFinite(row.value))
}

function hasExplainability(card: SavedAdvisorCard) {
  return Boolean(
    card.finalDecisionReason ||
    card.whyThisCard?.summary ||
    (card.rulesEvaluated && card.rulesEvaluated.length > 0) ||
    card.ruleScores
  )
}

export function RecommendationExplanationDialog({
  card,
  rank,
  triggerLabel = 'View full explanation',
  triggerClassName,
}: RecommendationExplanationDialogProps) {
  if (!hasExplainability(card)) {
    return null
  }

  const scoreRows = toScoreRows(card)
  const sortedRules = [...(card.rulesEvaluated || [])].sort((a, b) => {
    const aContribution = Number.isFinite(Number(a.contribution)) ? Number(a.contribution) : 0
    const bContribution = Number.isFinite(Number(b.contribution)) ? Number(b.contribution) : 0
    return bContribution - aContribution
  })
  const weightsUsed = card.ruleScores?.weightsUsed

  return (
    <Accordion
      type="single"
      collapsible
      className={cn('w-full', triggerClassName)}
      onValueChange={(value) => {
        if (!value) return
        void trackInteraction('recommendation_explanation_opened', {
          page: '/advisor',
          entityType: 'recommendation_explanation',
          entityId: card.id,
          metadata: {
            cardName: card.name,
            bank: card.bank,
            rank,
            finalScore: card.score,
          },
        })
      }}
    >
      <AccordionItem value={`explanation-${card.id}`} className="rounded-xl border border-border/60 bg-background/70 px-4">
        <AccordionTrigger className="py-3 text-sm">
          <span className="font-semibold text-foreground">{triggerLabel}</span>
        </AccordionTrigger>
        <AccordionContent className="pb-4">
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {typeof rank === 'number' && (
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary">
                  #{rank} match
                </Badge>
              )}
              <Badge variant="secondary" className="rounded-full">
                {card.bank}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-foreground">Why {card.name} was recommended</h3>
            <p className="leading-relaxed text-sm text-muted-foreground">
              This view shows the full rule list, scoring breakdown, and the main reasons this card ranked where it did.
            </p>
            </div>

          {(card.whyThisCard?.summary || card.finalDecisionReason) && (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Decision summary</p>
              {card.whyThisCard?.summary && (
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{card.whyThisCard.summary}</p>
              )}
              {card.finalDecisionReason && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.finalDecisionReason}</p>
              )}
            </div>
          )}

          {scoreRows.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Match score breakdown</p>
                <p className="text-sm font-semibold text-primary">Final score {Math.round(Number(card.score) || 0)}</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {scoreRows.map((row) => {
                  const value = Math.max(0, Math.min(100, row.value))
                  return (
                    <div key={row.id} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-foreground">{row.label}</span>
                        <span className={cn('text-sm font-semibold tabular-nums', scoreTone(value))}>
                          {Math.round(value)}
                        </span>
                      </div>
                      <Progress value={value} className="h-1.5" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {weightsUsed && (
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Weights used</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries({
                  Eligibility: weightsUsed.eligibilityFit,
                  Spend: weightsUsed.spendFit,
                  Goal: weightsUsed.goalFit,
                  Fees: weightsUsed.feeFit,
                  Balance: weightsUsed.diversificationFit,
                }).map(([label, value]) => (
                  <Badge key={label} variant="outline" className="rounded-full border-border/60 bg-muted/20">
                    {label} {formatPercentWeight(Number(value) || 0)}
                  </Badge>
                ))}
                {typeof weightsUsed.primaryGoalBoost === 'number' && (
                  <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary">
                    Goal boost x{weightsUsed.primaryGoalBoost.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {sortedRules.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full rule list</p>
                <span className="text-xs text-muted-foreground">Sorted by impact on ranking</span>
              </div>
              <div className="mt-4 space-y-3">
                {sortedRules.map((rule, index) => {
                  const score = Number.isFinite(Number(rule.score)) ? Number(rule.score) : 0
                  const contribution = Number.isFinite(Number(rule.contribution)) ? Number(rule.contribution) : 0
                  const weight = Number.isFinite(Number(rule.weight)) ? Number(rule.weight) : 0

                  return (
                    <div key={`${rule.ruleId}-${index}`} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {RULE_LABELS[rule.ruleId] || rule.label}
                            </p>
                            <Badge
                              variant="outline"
                              className={cn(
                                'rounded-full',
                                rule.matched
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-700'
                              )}
                            >
                              {rule.matched ? 'Matched strongly' : 'Partial match'}
                            </Badge>
                          </div>
                          {rule.detail && (
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{rule.detail}</p>
                          )}
                        </div>
                        <div className="grid shrink-0 grid-cols-3 gap-2 text-right text-xs sm:min-w-[220px]">
                          <div>
                            <p className="text-muted-foreground">Score</p>
                            <p className={cn('mt-1 font-semibold tabular-nums', scoreTone(score))}>{Math.round(score)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Weight</p>
                            <p className="mt-1 font-semibold tabular-nums text-foreground/85">{formatPercentWeight(weight)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Impact</p>
                            <p className="mt-1 font-semibold tabular-nums text-foreground/85">{contribution.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
