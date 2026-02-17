'use client'

import Link from 'next/link'
import { Sparkles, TrendingUp, CreditCard, Award, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const quickActions = [
  {
    title: 'Get Recommendation',
    description: 'Run profile-based card matching',
    icon: Sparkles,
    href: '/beginner',
    iconGradient: 'from-violet-500 to-purple-600',
    hoverGlow: 'group-hover:shadow-violet-500/10',
  },
  {
    title: 'Track Spending',
    description: 'Add transactions for accuracy',
    icon: TrendingUp,
    href: '/spending',
    iconGradient: 'from-emerald-500 to-green-600',
    hoverGlow: 'group-hover:shadow-emerald-500/10',
  },
  {
    title: 'Browse Cards',
    description: 'Explore the full catalog',
    icon: CreditCard,
    href: '/cards',
    iconGradient: 'from-blue-500 to-cyan-600',
    hoverGlow: 'group-hover:shadow-blue-500/10',
  },
  {
    title: 'Update CIBIL',
    description: 'Refresh eligibility score',
    icon: Award,
    href: '/profile',
    iconGradient: 'from-amber-500 to-orange-600',
    hoverGlow: 'group-hover:shadow-amber-500/10',
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
            className="gap-1.5 text-violet-600 hover:text-violet-500 hover:bg-violet-50/50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Advisor
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon
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
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center text-xs font-medium text-violet-600 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1">
                  Open
                  <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>

      <div className="mt-4 sm:hidden">
        <Link href="/advisor">
          <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-4 w-4" />
            Talk to AI Advisor
          </Button>
        </Link>
      </div>
    </div>
  )
}
