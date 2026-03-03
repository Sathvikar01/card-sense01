import weightsConfig from '@/config/recommendation-weights.json'

export type RecommendationWeightKey =
  | 'eligibilityFit'
  | 'spendFit'
  | 'goalFit'
  | 'feeFit'
  | 'diversificationFit'

export type RecommendationWeightSet = Record<RecommendationWeightKey, number>

export type RecommendationWeightConfig = {
  baseWeights: RecommendationWeightSet
  primaryGoalBoost: number
  answerInfluence: Record<string, number>
}

const DEFAULT_WEIGHTS: RecommendationWeightSet = {
  eligibilityFit: 0.3,
  spendFit: 0.25,
  goalFit: 0.25,
  feeFit: 0.15,
  diversificationFit: 0.05,
}

const DEFAULT_PRIMARY_GOAL_BOOST = 1.15

const DEFAULT_ANSWER_INFLUENCE: Record<string, number> = {
  value_priority: 1.08,
  primary_spend_focus: 1.05,
  reward_preference: 1.04,
  annual_fee_tolerance: 1.03,
  travel_frequency: 1.02,
  secured_card_readiness: 1.02,
  income_profile: 1.02,
  age_band: 1.01,
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const normalizeWeights = (weights: RecommendationWeightSet): RecommendationWeightSet => {
  const values = Object.values(weights)
  const total = values.reduce((sum, value) => sum + value, 0)
  if (!Number.isFinite(total) || total <= 0) {
    return { ...DEFAULT_WEIGHTS }
  }
  return {
    eligibilityFit: weights.eligibilityFit / total,
    spendFit: weights.spendFit / total,
    goalFit: weights.goalFit / total,
    feeFit: weights.feeFit / total,
    diversificationFit: weights.diversificationFit / total,
  }
}

export function getRecommendationWeightConfig(): RecommendationWeightConfig {
  const rawConfig = weightsConfig as Partial<{
    weights: Partial<RecommendationWeightSet>
    primaryGoalBoost: number
    answerInfluence: Record<string, number>
  }>

  const mergedWeights: RecommendationWeightSet = {
    ...DEFAULT_WEIGHTS,
    ...(rawConfig.weights || {}),
  }

  const primaryGoalBoost = clamp(
    Number(rawConfig.primaryGoalBoost ?? DEFAULT_PRIMARY_GOAL_BOOST),
    1,
    1.5
  )

  return {
    baseWeights: normalizeWeights(mergedWeights),
    primaryGoalBoost,
    answerInfluence: {
      ...DEFAULT_ANSWER_INFLUENCE,
      ...(rawConfig.answerInfluence || {}),
    },
  }
}
