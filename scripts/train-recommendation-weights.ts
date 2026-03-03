import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createAdminClient } from '../src/lib/supabase/admin'
import { LOCAL_CARD_CATALOG } from '../src/lib/cards/local-catalog'
import type { Database } from '../src/types/database'

type WeightSet = {
  eligibilityFit: number
  spendFit: number
  goalFit: number
  feeFit: number
  diversificationFit: number
}

type TrainingSample = {
  input: Record<string, unknown>
  topCardId?: string
  goal?: string
}

const OUTPUT_PATH = path.resolve(process.cwd(), 'src/config/recommendation-weights.json')

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const normalizeWeights = (weights: WeightSet): WeightSet => {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
  if (!Number.isFinite(total) || total <= 0) {
    return {
      eligibilityFit: 0.3,
      spendFit: 0.25,
      goalFit: 0.25,
      feeFit: 0.15,
      diversificationFit: 0.05,
    }
  }
  return {
    eligibilityFit: weights.eligibilityFit / total,
    spendFit: weights.spendFit / total,
    goalFit: weights.goalFit / total,
    feeFit: weights.feeFit / total,
    diversificationFit: weights.diversificationFit / total,
  }
}

const randomWeightSet = (): WeightSet => {
  const raw = {
    eligibilityFit: Math.random(),
    spendFit: Math.random(),
    goalFit: Math.random(),
    feeFit: Math.random(),
    diversificationFit: Math.random(),
  }
  return normalizeWeights(raw)
}

const mutate = (weights: WeightSet, rate: number): WeightSet => {
  const mutateValue = (value: number) =>
    Math.random() < rate ? value + (Math.random() - 0.5) * 0.2 : value

  return normalizeWeights({
    eligibilityFit: clamp(mutateValue(weights.eligibilityFit), 0.05, 0.6),
    spendFit: clamp(mutateValue(weights.spendFit), 0.05, 0.6),
    goalFit: clamp(mutateValue(weights.goalFit), 0.05, 0.6),
    feeFit: clamp(mutateValue(weights.feeFit), 0.05, 0.4),
    diversificationFit: clamp(mutateValue(weights.diversificationFit), 0.01, 0.2),
  })
}

const crossover = (a: WeightSet, b: WeightSet): WeightSet => {
  const pick = (key: keyof WeightSet) => (Math.random() > 0.5 ? a[key] : b[key])
  return normalizeWeights({
    eligibilityFit: pick('eligibilityFit'),
    spendFit: pick('spendFit'),
    goalFit: pick('goalFit'),
    feeFit: pick('feeFit'),
    diversificationFit: pick('diversificationFit'),
  })
}

const mapGoalToValuePriority = (goal?: string) => {
  if (!goal) return 'cashback_everyday'
  if (/credit|debt|low_interest/i.test(goal)) return 'build_credit_low_fee'
  if (/travel|lounge|vacation/i.test(goal)) return 'travel_perks'
  if (/upi|qr/i.test(goal)) return 'upi_qr_rewards'
  return 'cashback_everyday'
}

const seedSyntheticSamples = (): TrainingSample[] => {
  const sampleGoals = [
    'rewards_cashback',
    'travel_perks',
    'credit_building',
    'fuel_savings',
    'online_shopping',
  ]

  return sampleGoals.map((goal, idx) => {
    const card = LOCAL_CARD_CATALOG[idx % LOCAL_CARD_CATALOG.length]
    return {
      input: {
        primaryGoal: goal,
        cibilScore: 720,
        annualIncome: 600000,
        topSpendingCategories: ['groceries', 'travel', 'shopping'],
      },
      topCardId: card.id,
      goal,
    }
  })
}

const fetchSupabaseSamples = async (): Promise<TrainingSample[]> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return []
  }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('recommendation_logs')
      .select('recommendation_id, card_id, rank, recommendation:recommendations(input_snapshot)')
      .eq('rank', 1)
      .limit(120)

    if (error || !data) {
      return []
    }

    type RecommendationLogRow = Database['public']['Tables']['recommendation_logs']['Row'] & {
      recommendation?: { input_snapshot?: Record<string, unknown> } | null
    }
    const rows = (data || []) as RecommendationLogRow[]

    return rows.map((row) => {
      const input = row.recommendation?.input_snapshot
      return {
        input: input || {},
        topCardId: typeof row.card_id === 'string' ? row.card_id : undefined,
        goal: typeof input?.primaryGoal === 'string' ? input.primaryGoal : undefined,
      }
    })
  } catch {
    return []
  }
}

const fetchExternalIncomeSamples = async (): Promise<TrainingSample[]> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)
  try {
    const response = await fetch(
      'https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data',
      { signal: controller.signal }
    )
    if (!response.ok) {
      return []
    }
    const raw = await response.text()
    const lines = raw.split('\n').slice(0, 300)
    return lines
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((part) => part.trim()))
      .filter((parts) => parts.length >= 15)
      .map((parts) => {
        const age = Number(parts[0])
        const workclass = parts[1]
        const hours = Number(parts[12])
        const incomeClass = parts[14]
        const highIncome = incomeClass.includes('>50K')
        const annualIncome = highIncome ? 900000 : 350000
        const employmentType = /self-emp/i.test(workclass) ? 'self_employed' : 'salaried'
        const goal = highIncome ? 'travel_perks' : 'rewards_cashback'

        return {
          input: {
            age: Number.isFinite(age) ? age : 28,
            annualIncome,
            monthlyIncome: Math.round(annualIncome / 12),
            employmentType,
            primaryGoal: goal,
            topSpendingCategories: highIncome ? ['travel', 'dining'] : ['groceries', 'utilities'],
            weeklyWorkHours: Number.isFinite(hours) ? hours : 40,
          },
          goal,
        }
      })
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

const scoreWeightSet = (weights: WeightSet, samples: TrainingSample[]) => {
  const baseGoalWeight = weights.goalFit
  const goalBoost = clamp(1 + baseGoalWeight * 0.6, 1.05, 1.35)
  let score = 0

  for (const sample of samples) {
    const goalPriority = mapGoalToValuePriority(sample.goal)
    const topCategories = Array.isArray(sample.input.topSpendingCategories)
      ? (sample.input.topSpendingCategories as string[])
      : []
    const annualIncome = Number(sample.input.annualIncome || 0)
    const card = sample.topCardId
      ? LOCAL_CARD_CATALOG.find((entry) => entry.id === sample.topCardId)
      : null

    const cardBestFor = card?.best_for || []
    const categoryMatches = topCategories.filter((category) =>
      cardBestFor.includes(category)
    ).length
    const categoryMatch = topCategories.length > 0
      ? categoryMatches / topCategories.length
      : 0.75

    const goalMatch = goalPriority === 'travel_perks'
      ? cardBestFor.includes('travel') || cardBestFor.includes('lounge')
      : goalPriority === 'build_credit_low_fee'
        ? (card?.annual_fee || 0) <= 500
        : true

    const feeComfort = annualIncome > 0
      ? (card?.annual_fee || 0) <= annualIncome * 0.01
      : (card?.annual_fee || 0) <= 1000

    const weighted =
      weights.eligibilityFit * 0.8 +
      weights.spendFit * categoryMatch +
      weights.goalFit * (goalMatch ? 1 : 0.7) * goalBoost +
      weights.feeFit * (feeComfort ? 1 : 0.6) +
      weights.diversificationFit * 0.6

    score += weighted
  }

  return score / Math.max(samples.length, 1)
}

const runGA = (populationSize: number, generations: number, mutationRate: number) => {
  let population = Array.from({ length: populationSize }, randomWeightSet)

  return async (samples: TrainingSample[]) => {
    let best = population[0]
    let bestScore = -Infinity

    for (let gen = 0; gen < generations; gen += 1) {
      const scored = population
        .map((weights) => ({
          weights,
          score: scoreWeightSet(weights, samples),
        }))
        .sort((a, b) => b.score - a.score)

      if (scored[0].score > bestScore) {
        bestScore = scored[0].score
        best = scored[0].weights
      }

      const elites = scored.slice(0, Math.max(2, Math.floor(populationSize * 0.2)))
      const next = [...elites.map((item) => item.weights)]

      while (next.length < populationSize) {
        const parentA = elites[Math.floor(Math.random() * elites.length)].weights
        const parentB = elites[Math.floor(Math.random() * elites.length)].weights
        const child = mutate(crossover(parentA, parentB), mutationRate)
        next.push(child)
      }

      population = next
    }

    return best
  }
}

async function main() {
  const population = Number(process.env.GA_POPULATION || 60)
  const generations = Number(process.env.GA_GENERATIONS || 40)
  const mutationRate = Number(process.env.GA_MUTATION_RATE || 0.18)

  const [supabaseSamples, syntheticSamples, externalSamples] = await Promise.all([
    fetchSupabaseSamples(),
    Promise.resolve(seedSyntheticSamples()),
    fetchExternalIncomeSamples(),
  ])

  const samples = [...supabaseSamples, ...syntheticSamples, ...externalSamples]
  const run = runGA(population, generations, mutationRate)
  const bestWeights = await run(samples)

  const output = {
    version: 1,
    updatedAt: new Date().toISOString(),
    weights: bestWeights,
    primaryGoalBoost: clamp(1 + bestWeights.goalFit * 0.6, 1.05, 1.35),
    answerInfluence: {
      value_priority: 1.1,
      primary_spend_focus: 1.06,
      reward_preference: 1.04,
      annual_fee_tolerance: 1.03,
      travel_frequency: 1.02,
      secured_card_readiness: 1.02,
      income_profile: 1.02,
      age_band: 1.01,
    },
    training: {
      source: 'ga',
      population,
      generations,
      mutationRate,
      sampleSize: samples.length,
    },
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  console.log(`Updated recommendation weights at ${OUTPUT_PATH}`)
}

main().catch((error) => {
  console.error('Weight training failed:', error)
  process.exit(1)
})
