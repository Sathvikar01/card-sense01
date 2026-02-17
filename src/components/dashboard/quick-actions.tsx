'use client'

import Link from 'next/link'
import { Sparkles, TrendingUp, CreditCard, Award, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickActions = [
  {
    title: 'Get Recommendation',
    description: 'Run profile-based card matching now',
    icon: Sparkles,
    href: '/beginner',
    iconClass: 'text-primary',
    badgeClass: 'bg-primary/10',
  },
  {
    title: 'Track Spending',
    description: 'Add transactions and improve fit accuracy',
    icon: TrendingUp,
    href: '/spending',
    iconClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-50',
  },
  {
    title: 'Browse Cards',
    description: 'Scan complete catalog with filters',
    icon: CreditCard,
    href: '/cards',
    iconClass: 'text-foreground/80',
    badgeClass: 'bg-secondary',
  },
  {
    title: 'Update CIBIL',
    description: 'Refresh score and recalculate eligibility',
    icon: Award,
    href: '/profile',
    iconClass: 'text-amber-600',
    badgeClass: 'bg-amber-50',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Common tasks that keep recommendations accurate
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.title} href={action.href} className="group">
                <div className="h-full rounded-2xl border border-border/70 bg-background/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg hover:shadow-black/5">
                  <div
                    className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${action.badgeClass} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className={`h-5 w-5 ${action.iconClass}`} />
                  </div>

                  <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>

                  <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Open
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 border-t border-border/70 pt-6 sm:hidden">
          <Link href="/advisor">
            <Button className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Talk to AI Advisor
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
