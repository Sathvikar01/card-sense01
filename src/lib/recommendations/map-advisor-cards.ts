import type { SavedAdvisorCard } from '@/lib/store/advisor-store'

/** Normalizes card rows from /api/ai/recommend and /api/recommendations/latest (old and new field names). */
export function mapAdvisorCards(cards: Record<string, unknown>[] = []): SavedAdvisorCard[] {
  return cards.map((card) => ({
    id: String(card.id || card.cardId || ''),
    cardSlug: card.cardSlug ? String(card.cardSlug) : undefined,
    imageUrl: card.imageUrl ? String(card.imageUrl) : null,
    name: String(card.name || card.cardName || ''),
    bank: String(card.bank || ''),
    score: Number(card.score || 0),
    reason: String(card.reason || card.reasoning || ''),
    annualFee: Number(card.annualFee ?? 0),
    rewardRate: Number(card.rewardRate || 0),
    estimatedAnnualValue: Number(card.estimatedAnnualValue || card.annualValue || 0),
    pros: (card.pros || card.keyPerks || []) as string[],
    cons: (card.cons || []) as string[],
    bestCategories: (card.bestCategories || card.bestFor || []) as string[],
    eligibilityMatch: (card.eligibilityMatch || 'moderate') as SavedAdvisorCard['eligibilityMatch'],
    usageStrategy: String(card.usageStrategy || ''),
    finalDecisionReason: card.finalDecisionReason ? String(card.finalDecisionReason) : undefined,
    rulesEvaluated: Array.isArray(card.rulesEvaluated)
      ? (card.rulesEvaluated as SavedAdvisorCard['rulesEvaluated'])
      : undefined,
    ruleScores:
      card.ruleScores && typeof card.ruleScores === 'object'
        ? (card.ruleScores as SavedAdvisorCard['ruleScores'])
        : undefined,
    whyThisCard:
      card.whyThisCard && typeof card.whyThisCard === 'object'
        ? (card.whyThisCard as SavedAdvisorCard['whyThisCard'])
        : undefined,
  }))
}
