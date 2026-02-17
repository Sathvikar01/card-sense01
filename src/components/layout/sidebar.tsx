'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sparkles,
  Brain,
  CreditCard,
  TrendingUp,
  BookOpen,
  User,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Beginner Advisor', href: '/beginner', icon: Sparkles },
  { name: 'Smart Advisor', href: '/advisor', icon: Brain },
  { name: 'Browse Cards', href: '/cards', icon: CreditCard },
  { name: 'Spending Tracker', href: '/spending', icon: TrendingUp },
  { name: 'Education', href: '/education', icon: BookOpen },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:p-3">
      <div className="cardsense-panel relative flex h-full flex-col overflow-hidden rounded-3xl border px-4 pb-4 pt-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/12 to-transparent"
        />

        <Link href="/" className="relative z-10 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">CardSense</p>
            <p className="text-lg font-semibold text-foreground">India Advisor</p>
          </div>
        </Link>

        <nav className="relative z-10 mt-8 flex-1 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

            return (
              <Link
                key={item.name}
                href={item.href}
                data-active={isActive ? 'true' : 'false'}
                className={cn(
                  'cardsense-nav-item group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="relative z-10 mt-4 rounded-2xl border border-border/70 bg-background/55 px-3 py-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Smarter over time</p>
          <p className="mt-1 leading-relaxed">
            Recommendations improve as you add spending data and update your profile.
          </p>
        </div>
      </div>
    </div>
  )
}
