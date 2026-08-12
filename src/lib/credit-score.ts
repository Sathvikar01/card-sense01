export const CIBIL_SCORE_RANGES = [
  { min: 800, max: 900, label: 'Excellent', color: '#16a34a', bg: 'bg-green-600' },
  { min: 750, max: 799, label: 'Very Good', color: '#22c55e', bg: 'bg-green-500' },
  { min: 700, max: 749, label: 'Good', color: '#2563eb', bg: 'bg-blue-600' },
  { min: 650, max: 699, label: 'Fair', color: '#f59e0b', bg: 'bg-amber-500' },
  { min: 300, max: 649, label: 'Needs Improvement', color: '#dc2626', bg: 'bg-red-600' },
] as const

export function getCibilScoreRange(score: number) {
  const normalized = Math.max(300, Math.min(900, score))
  return CIBIL_SCORE_RANGES.find((range) => normalized >= range.min && normalized <= range.max)
    ?? CIBIL_SCORE_RANGES[CIBIL_SCORE_RANGES.length - 1]
}

export const getCibilScoreRating = (score: number) => getCibilScoreRange(score).label
export const getCibilScoreHexColor = (score: number) => getCibilScoreRange(score).color

export interface CreditScoreHistoryPoint {
  id?: string
  credit_score: number
  score_date: string
}

/**
 * Score history is the source of truth for the current score. Profile rows
 * can lag behind after imports or older advisor runs, so every surface uses
 * the newest dated history entry when one exists.
 */
export function getLatestRecordedCreditScore(
  history: CreditScoreHistoryPoint[] | null | undefined,
  fallback: number | null | undefined
) {
  const latest = [...(history || [])]
    .filter((entry) => Number.isFinite(entry.credit_score) && entry.credit_score > 0 && entry.score_date)
    .sort((a, b) => {
      const dateDiff = new Date(b.score_date).getTime() - new Date(a.score_date).getTime()
      if (dateDiff !== 0) return dateDiff
      return String(b.id || '').localeCompare(String(a.id || ''))
    })[0]

  return latest?.credit_score ?? fallback ?? null
}
