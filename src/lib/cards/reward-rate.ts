const roundRate = (value: number) => Math.round(value * 100) / 100

/** Returns a conservative cash-equivalent base reward percentage. */
export function estimateBaseRewardRate(description: string | null | undefined) {
  if (!description) return 0

  const normalized = description.replace(/₹/g, 'INR').replace(/,/g, '').toLowerCase()
  const cashbackPatterns = [
    /([\d.]+)%\s+(?:cashback|back)\s+on\s+(?:all\s+)?(?:other|offline|all)\s+spends?/,
    /([\d.]+)%\s+on\s+(?:all\s+)?(?:other|offline|all)\s+spends?/,
    /([\d.]+)%\s+(?:cashback|back)\s+on\s+everything\s+else/,
    /([\d.]+)%\s+(?:cashback|back)\s+on\s+all\s+spends?/,
    /([\d.]+)%\s+unlimited\s+cashback/,
  ]

  for (const pattern of cashbackPatterns) {
    const match = normalized.match(pattern)
    if (match) return roundRate(Number(match[1]))
  }

  const pointsMatch = normalized.match(/([\d.]+)\s+(?:reward\s+)?points?\s+per\s+inr\s+([\d.]+)/)
  const pointValueMatch = normalized.match(/1\s+point\s*=\s*inr\s+([\d.]+)/)
  if (pointsMatch && pointValueMatch) {
    const points = Number(pointsMatch[1])
    const spend = Number(pointsMatch[2])
    const pointValue = Number(pointValueMatch[1])
    if (spend > 0) return roundRate((points * pointValue * 100) / spend)
  }

  return 0
}

export function normalizeRewardRate<
  T extends { description?: string | null; reward_rate_default: number },
>(card: T): T {
  return { ...card, reward_rate_default: estimateBaseRewardRate(card.description) }
}
