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
