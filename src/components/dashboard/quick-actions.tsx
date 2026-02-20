'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const quickActions = [
  {
    title: 'Get Recommendation',
    description: 'Run profile-based card matching',
    icon: SparkQaSVG,
    href: '/advisor',
    iconGradient: 'from-[#b8860b] to-[#d4a017]',
    hoverGlow: 'group-hover:shadow-[#b8860b]/10',
  },
  {
    title: 'Track Spending',
    description: 'Add transactions for accuracy',
    icon: ChartQaSVG,
    href: '/spending',
    iconGradient: 'from-emerald-500 to-green-600',
    hoverGlow: 'group-hover:shadow-emerald-500/10',
  },
  {
    title: 'Browse Cards',
    description: 'Explore the full catalog',
    icon: CardQaSVG,
    href: '/cards',
    iconGradient: 'from-blue-500 to-cyan-600',
    hoverGlow: 'group-hover:shadow-blue-500/10',
  },
  {
    title: 'Update CIBIL',
    description: 'Refresh eligibility score',
    icon: ShieldQaSVG,
    href: '/profile',
    iconGradient: 'from-[#b8860b] to-[#d4a017]',
    hoverGlow: 'group-hover:shadow-[#b8860b]/10',
  },
]

export function QuickActions() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">Common tasks to keep recommendations sharp</p>
        </div>
        <Link href="/advisor" className="hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-[#b8860b] hover:text-[#d4a017] hover:bg-[#fdf3d7]/50"
          >
            <BrainQaSVG />
            AI Advisor
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const IconComp = action.icon
          return (
            <Link key={action.title} href={action.href} className="group">
              <motion.div
                className={`quick-action-card h-full p-4 ${action.hoverGlow}`}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.iconGradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <IconComp />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center text-xs font-medium text-[#b8860b] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
                  Open
                  <ArrowRightQaSVG />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 sm:hidden">
        <Link href="/advisor">
          <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] shadow-lg shadow-[#b8860b]/20">
            <BrainQaSVG />
            Talk to AI Advisor
          </Button>
        </Link>
      </div>
    </div>
  )
}

/* ===== Custom SVG icons ===== */

function SparkQaSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l2 5.5L17.5 10l-5.5 2L10 17.5l-2-5.5L2.5 10l5.5-2z" fill="white" opacity="0.9" />
      <path d="M15 2l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8L12.6 4.4l1.8-.6z" fill="white" opacity="0.5" />
    </svg>
  )
}

function ChartQaSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 16.5h15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="4" y="9" width="3" height="7.5" rx="1" fill="white" opacity="0.85" />
      <rect x="8.5" y="5" width="3" height="11.5" rx="1" fill="white" opacity="0.7" />
      <rect x="13" y="7" width="3" height="9.5" rx="1" fill="white" opacity="0.55" />
    </svg>
  )
}

function CardQaSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4.5" width="16" height="11" rx="2.5" stroke="white" strokeWidth="1.5" fill="none" />
      <line x1="2" y1="8.5" x2="18" y2="8.5" stroke="white" strokeWidth="1.5" />
      <rect x="5" y="11.5" width="4.5" height="1.5" rx="0.75" fill="white" opacity="0.5" />
    </svg>
  )
}

function ShieldQaSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L4 4.5v4.5c0 3.8 2.8 7 6 8.5 3.2-1.5 6-4.7 6-8.5V4.5L10 2z" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BrainQaSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5C6.5 2.5 5.2 3.3 4.6 4.5 3.1 4.8 2 6.1 2 7.7c0 1.3.7 2.4 1.7 3 0 .2-.1.5-.1.8 0 1.7 1.3 3 3 3h2.8c1.7 0 3-1.3 3-3 0-.3 0-.5-.1-.8 1-.6 1.7-1.7 1.7-3 0-1.6-1.1-2.9-2.6-3.2C10.8 3.3 9.5 2.5 8 2.5z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M8 5.5v5M6.5 8h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

function ArrowRightQaSVG() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-1">
      <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
