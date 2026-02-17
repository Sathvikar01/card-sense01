'use client'

import Link from 'next/link'
import { Sparkles, TrendingUp, CreditCard, Award, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const quickActions = [
  {
    title: 'Get Recommendation',
    description: 'Run profile-based card matching now',
    icon: Sparkles,
    href: '/beginner',
    iconGradient: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Track Spending',
    description: 'Add transactions and improve fit accuracy',
    icon: TrendingUp,
    href: '/spending',
    iconGradient: 'from-emerald-500 to-green-600',
  },
  {
    title: 'Browse Cards',
    description: 'Scan complete catalog with filters',
    icon: CreditCard,
    href: '/cards',
    iconGradient: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Update CIBIL',
    description: 'Refresh score and recalculate eligibility',
    icon: Award,
    href: '/profile',
    iconGradient: 'from-amber-500 to-orange-600',
  },
]

export function QuickActions() {
  return (
    <Card className="overflow-hidden border-white/30 bg-white/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Common tasks that keep recommendations accurate
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href} className="group">
                <motion.div
                  className="h-full rounded-2xl border border-white/40 bg-white/40 p-4 backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-violet-500/5"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${action.iconGradient} shadow-lg transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>

                  <div className="mt-4 flex items-center text-xs font-medium text-violet-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Open
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 border-t border-white/30 pt-6 sm:hidden">
          <Link href="/advisor">
            <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-4 w-4" />
              Talk to AI Advisor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
