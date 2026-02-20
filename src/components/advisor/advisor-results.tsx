'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { CardDetailLink } from '@/components/cards/card-detail-link'
import { LayoutGrid, List, TrendingUp, Award, ArrowRight, GitCompare, Wallet, Shield, Target, Briefcase, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAnalysisStore } from '@/store/use-analysis-store'
import { motion } from 'framer-motion'
import type { UserPersona } from '@/lib/store/advisor-store'
import type { SavedAdvisorCard, SavedAdvisorResult, ProfileSummaryData } from '@/lib/store/advisor-store'

/* ------------------------------------------------------------------ */
/*  Re-export types under the names used by the advisor page          */
/* ------------------------------------------------------------------ */

export type AdvisorCardResult = SavedAdvisorCard
export type AdvisorResult = SavedAdvisorResult

/* ------------------------------------------------------------------ */
/*  Score ring SVG                                                     */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  const color =
    score >= 85 ? 'stroke-emerald-500' :
    score >= 70 ? 'stroke-lime-500' :
    score >= 55 ? 'stroke-amber-500' : 'stroke-red-400'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth={3}
          fill="none"
          className="text-muted/60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={cn(color, 'transition-all duration-700 ease-out')}
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums text-foreground">
        {score}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Eligibility badge                                                  */
/* ------------------------------------------------------------------ */

function EligibilityBadge({ level }: { level: AdvisorCardResult['eligibilityMatch'] }) {
  const config = {
    high: { label: 'High approval likelihood', bg: 'bg-emerald-500/10', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    moderate: { label: 'Moderate approval likelihood', bg: 'bg-amber-500/10', text: 'text-amber-700', dot: 'bg-amber-500' },
    uncertain: { label: 'Approval uncertain', bg: 'bg-red-400/10', text: 'text-red-600', dot: 'bg-red-400' },
  }
  const c = config[level]
  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1', c.bg)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      <span className={cn('text-[11px] font-medium', c.text)}>{c.label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Detailed card (existing style)                                     */
/* ------------------------------------------------------------------ */

function ResultCard({ card, rank }: { card: AdvisorCardResult; rank: number }) {
  return (
    <div className="group relative rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_-8px_oklch(0.30_0.04_270/0.14)]">
      {/* Rank stripe */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl',
        rank === 1 ? 'bg-primary' : rank === 2 ? 'bg-primary/60' : 'bg-primary/30'
      )} />

      <div className="p-5 pl-6 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-[11px] font-bold text-muted-foreground tabular-nums">
                {rank}
              </span>
              <h3 className="text-base font-semibold text-foreground">{card.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{card.bank}</p>
          </div>
          <ScoreRing score={card.score} />
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted/30 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Annual Fee</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {card.annualFee === 0 ? 'Free' : `INR ${card.annualFee.toLocaleString('en-IN')}`}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Reward Rate</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{card.rewardRate}%</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Est. Value/yr</p>
            <p className="text-sm font-semibold text-primary mt-0.5">
              {card.estimatedAnnualValue > 0 ? `INR ${card.estimatedAnnualValue.toLocaleString('en-IN')}` : '--'}
            </p>
          </div>
        </div>

        {/* Eligibility */}
        <EligibilityBadge level={card.eligibilityMatch} />

        {/* Reason */}
        <p className="text-sm text-foreground/80 leading-relaxed">{card.reason}</p>

        {/* Best for categories */}
        {card.bestCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {card.bestCategories.map((cat) => (
              <span key={cat} className="rounded-md bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {card.pros.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Advantages</p>
              <ul className="space-y-1">
                {card.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/70 leading-snug">
                    <span className="mt-1 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {card.cons.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Caveats</p>
              <ul className="space-y-1">
                {card.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/70 leading-snug">
                    <span className="mt-1 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Usage strategy */}
        {card.usageStrategy && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs font-semibold text-foreground mb-1">How to use this card</p>
            <p className="text-xs text-foreground/70 leading-relaxed">{card.usageStrategy}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Card grid tile (same layout as CardTile + match rank badge)       */
/* ------------------------------------------------------------------ */

const RANK_GRADIENTS = [
  'from-amber-500 to-yellow-400',
  'from-slate-400 to-slate-300',
  'from-amber-700 to-amber-600',
]

function RecommendedCardGridTile({ card, rank }: { card: AdvisorCardResult; rank: number }) {
  const rankLabel = rank === 1 ? '#1 Match' : rank === 2 ? '#2 Match' : '#3 Match'

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <CardDetailLink cardId={card.id} className="group block">
        <div className="stat-card-premium overflow-hidden transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-violet-500/5">

          {/* Card visual — identical to CardTile, no overlays */}
          <div className="flex justify-center bg-gradient-to-b from-violet-50/30 to-transparent px-6 pb-2 pt-6">
            <CreditCardVisual cardId={card.id} size="sm" bankName={card.bank} interactive />
          </div>

          {/* Content */}
          <div className="space-y-4 px-5 pb-5 pt-4">

            {/* Header: rank badge + card info + score */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-bold text-white bg-gradient-to-r',
                    RANK_GRADIENTS[rank - 1] ?? RANK_GRADIENTS[2]
                  )}>
                    {rankLabel}
                  </span>
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground leading-snug">
                  {card.bank}
                </p>
                <h3 className="text-base font-semibold leading-tight text-foreground">{card.name}</h3>
              </div>
              {/* Match score badge */}
              <div className="shrink-0 flex items-center justify-center h-9 w-9 rounded-full border-2 border-primary/20 bg-primary/5 text-sm font-bold text-primary tabular-nums">
                {card.score}
              </div>
            </div>

            {/* Eligibility dot */}
            <div className="flex items-center gap-1.5">
              <EligibilityBadgeDot level={card.eligibilityMatch} />
              <span className="text-[11px] text-muted-foreground">
                {card.eligibilityMatch === 'high' ? 'High approval likelihood' :
                 card.eligibilityMatch === 'moderate' ? 'Moderate approval likelihood' :
                 'Approval uncertain'}
              </span>
            </div>

            {/* Key metrics — same pattern as CardTile */}
            <div className="space-y-2.5 border-t border-border/30 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Annual Fee</span>
                <span className="font-semibold text-foreground">
                  {card.annualFee === 0 ? 'Free' : `Rs. ${card.annualFee.toLocaleString('en-IN')}`}
                </span>
              </div>

              {card.rewardRate > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-50">
                    <TrendingUp className="h-3 w-3 text-violet-600" />
                  </div>
                  <span className="text-muted-foreground">{card.rewardRate}% base rewards</span>
                </div>
              )}

              {card.estimatedAnnualValue > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-50">
                    <Award className="h-3 w-3 text-amber-600" />
                  </div>
                  <span className="text-muted-foreground">
                    Est. Rs. {card.estimatedAnnualValue.toLocaleString('en-IN')} / yr value
                  </span>
                </div>
              )}
            </div>

            {/* Tags — same pattern as CardTile's best_for badges */}
            {(card.bestCategories.length > 0 || card.pros.length > 0) && (
              <div className="flex flex-wrap gap-1">
                {(card.bestCategories.length > 0 ? card.bestCategories : card.pros)
                  .slice(0, 3)
                  .map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="rounded-full bg-secondary/60 px-2 py-[3px] text-[10px]"
                    >
                      {tag.replace(/_/g, ' ')}
                    </Badge>
                  ))}
              </div>
            )}

            {/* CTA — same as CardTile */}
            <div className="flex items-center justify-between border-t border-border/30 pt-3">
              <span className="text-xs font-medium text-violet-600">View Details</span>
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </CardDetailLink>
    </motion.div>
  )
}

function EligibilityBadgeDot({ level }: { level: AdvisorCardResult['eligibilityMatch'] }) {
  const config = {
    high: { dot: 'bg-emerald-500', title: 'High approval likelihood' },
    moderate: { dot: 'bg-amber-500', title: 'Moderate approval likelihood' },
    uncertain: { dot: 'bg-red-400', title: 'Approval uncertain' },
  }
  const c = config[level]
  return (
    <span
      className={cn('h-2.5 w-2.5 rounded-full shrink-0 mt-1', c.dot)}
      title={c.title}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Profile summary card                                               */
/* ------------------------------------------------------------------ */

const SPENDING_PILL_COLORS: Record<string, string> = {
  dining: 'bg-orange-100 text-orange-800 border-orange-200',
  shopping: 'bg-pink-100 text-pink-800 border-pink-200',
  online_shopping: 'bg-pink-100 text-pink-800 border-pink-200',
  travel: 'bg-blue-100 text-blue-800 border-blue-200',
  groceries: 'bg-green-100 text-green-800 border-green-200',
  entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
  fuel: 'bg-amber-100 text-amber-800 border-amber-200',
  utilities: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  bills: 'bg-violet-100 text-violet-800 border-violet-200',
  rent: 'bg-violet-100 text-violet-800 border-violet-200',
  healthcare: 'bg-red-100 text-red-800 border-red-200',
  education: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
}

function getCreditScoreStyle(scoreStr: string | undefined) {
  if (!scoreStr) return { dot: 'bg-slate-400', iconBg: 'bg-slate-100 text-slate-600', text: 'text-slate-600', label: '' }
  const num = parseInt(scoreStr.replace(/\D/g, ''), 10)
  if (isNaN(num)) return { dot: 'bg-slate-400', iconBg: 'bg-slate-100 text-slate-600', text: 'text-slate-600', label: 'No history' }
  if (num >= 800) return { dot: 'bg-green-500', iconBg: 'bg-green-100 text-green-600', text: 'text-green-700', label: 'Excellent' }
  if (num >= 750) return { dot: 'bg-emerald-500', iconBg: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700', label: 'Very Good' }
  if (num >= 700) return { dot: 'bg-lime-500', iconBg: 'bg-lime-100 text-lime-700', text: 'text-lime-700', label: 'Good' }
  if (num >= 650) return { dot: 'bg-amber-500', iconBg: 'bg-amber-100 text-amber-600', text: 'text-amber-700', label: 'Fair' }
  if (num >= 600) return { dot: 'bg-orange-500', iconBg: 'bg-orange-100 text-orange-600', text: 'text-orange-700', label: 'Needs Work' }
  return { dot: 'bg-red-500', iconBg: 'bg-red-100 text-red-600', text: 'text-red-700', label: 'Low' }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function ProfileSummaryCard({ data }: { data: ProfileSummaryData }) {
  const scoreStyle = getCreditScoreStyle(data.creditScore)
  const hasAnyData = data.monthlyIncome || data.creditScore || data.age || data.employment || data.persona || (data.topSpending && data.topSpending.length > 0)
  if (!hasAnyData) return null

  const secondaryItems: { icon: React.ReactNode; iconBg: string; label: string; value: string }[] = []
  if (data.age) {
    secondaryItems.push({
      icon: <User className="h-3.5 w-3.5" />,
      iconBg: 'bg-blue-100 text-blue-600',
      label: 'Age',
      value: `${data.age} years`,
    })
  }
  if (data.employment) {
    secondaryItems.push({
      icon: <Briefcase className="h-3.5 w-3.5" />,
      iconBg: 'bg-amber-100 text-amber-600',
      label: 'Employment',
      value: cap(data.employment),
    })
  }
  if (data.persona) {
    secondaryItems.push({
      icon: <Target className="h-3.5 w-3.5" />,
      iconBg: 'bg-primary/10 text-primary',
      label: 'Profile',
      value: cap(data.persona),
    })
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-4">
      {/* Header */}
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Your Profile</p>

      {/* Tier 1: Primary stats */}
      {(data.monthlyIncome || data.creditScore) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.monthlyIncome && (
            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/70 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Monthly Income</p>
                <p className="text-base font-bold text-foreground tabular-nums mt-0.5">
                  ₹{data.monthlyIncome.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-muted-foreground">per month</p>
              </div>
            </div>
          )}
          {data.creditScore && (
            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/70 p-4">
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', scoreStyle.iconBg)}>
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Credit Score</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-base font-bold text-foreground tabular-nums">{data.creditScore}</p>
                  <span className={cn('h-2 w-2 rounded-full shrink-0', scoreStyle.dot)} />
                </div>
                <p className={cn('text-[10px] font-medium', scoreStyle.text)}>{scoreStyle.label}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tier 2: Secondary stats */}
      {secondaryItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {secondaryItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/50 px-3 py-2.5">
              <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', item.iconBg)}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide leading-none">{item.label}</p>
                <p className="text-xs font-semibold text-foreground mt-0.5 leading-tight truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tier 3: Spending categories */}
      {data.topSpending && data.topSpending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Top spending categories</p>
          <div className="flex flex-wrap gap-1.5">
            {data.topSpending.map((cat) => {
              const key = cat.toLowerCase().replace(/\s+/g, '_')
              const pillClass = SPENDING_PILL_COLORS[key] ?? SPENDING_PILL_COLORS.other
              return (
                <span key={cat} className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', pillClass)}>
                  {cat.split(' ').map(cap).join(' ')}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main results component                                             */
/* ------------------------------------------------------------------ */

interface Props {
  result: AdvisorResult
  onStartOver: () => void
}

export function AdvisorResults({ result, onStartOver }: Props) {
  const [viewMode, setViewMode] = useState<'detailed' | 'grid'>('detailed')
  const router = useRouter()
  const { clearComparison, toggleCompareCard } = useAnalysisStore()

  const handleCompareAll = () => {
    clearComparison()
    for (const card of result.cards) {
      toggleCompareCard(card.id, { id: card.id, card_name: card.name, bank_name: card.bank } as never)
    }
    router.push('/cards/compare')
  }

  const PERSONA_LABELS: Record<string, string> = {
    student_firsttime: 'Student / First-time user',
    salaried_everyday: 'Salaried professional',
    rewards_maximizer: 'Rewards maximizer',
    frequent_traveller: 'Frequent traveller',
    online_shopper: 'Online shopper',
    self_employed: 'Self-employed / Business owner',
    credit_builder: 'Credit builder / Rebuilder',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            Your recommendations
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {result.persona && (
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/[0.05] px-3 py-1 text-xs font-medium text-primary">
                {PERSONA_LABELS[result.persona] ?? result.persona}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {result.cards.length} cards matched your profile
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onStartOver} className="shrink-0 gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7a5 5 0 019.33-2.5M12 7a5 5 0 01-9.33 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M11 2v3h-3M3 12V9h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Start over
        </Button>
      </div>

      {/* View mode toggle + Compare */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1 w-fit">
          <button
            onClick={() => setViewMode('detailed')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              viewMode === 'detailed'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <List className="h-3.5 w-3.5" />
            Detailed
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Card View
          </button>
        </div>

        {result.cards.length >= 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCompareAll}
            className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Compare All {result.cards.length} Cards
          </Button>
        )}
      </div>

      {/* Profile summary */}
      {result.profileSummary && (
        typeof result.profileSummary === 'string' ? (
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Profile summary</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{result.profileSummary}</p>
          </div>
        ) : (
          <ProfileSummaryCard data={result.profileSummary} />
        )
      )}

      {/* Analysis */}
      {result.analysis && (
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Analysis</p>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{result.analysis}</p>
        </div>
      )}

      {/* Card list / grid */}
      {viewMode === 'detailed' ? (
        <div className="space-y-4">
          {result.cards.map((card, index) => (
            <ResultCard key={card.id} card={card} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <RecommendedCardGridTile card={card} rank={index + 1} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Button variant="outline" onClick={onStartOver} className="gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7a5 5 0 019.33-2.5M12 7a5 5 0 01-9.33 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M11 2v3h-3M3 12V9h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Adjust answers
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-xl mx-auto">
        Recommendations are based on publicly available card information and your stated profile. Actual approval depends on the issuer&apos;s criteria. Reward calculations are estimates and may vary. We do not guarantee approval or specific reward rates.
      </p>
    </div>
  )
}
