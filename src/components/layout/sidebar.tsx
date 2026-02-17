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
import { motion } from 'framer-motion'

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
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/50 px-4 pb-4 pt-5 shadow-xl shadow-black/[0.03] backdrop-blur-2xl">
        {/* Gradient glow at top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-500/8 via-purple-500/4 to-transparent"
        />

        {/* Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-3 rounded-xl px-2 py-2">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CreditCard className="h-6 w-6" />
          </motion.div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/70">CardSense</p>
            <p className="text-lg font-semibold text-foreground">India Advisor</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="relative z-10 mt-8 flex-1 space-y-1">
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
                    'mr-3 h-5 w-5 shrink-0 transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl border border-violet-200/40 bg-violet-50/50"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom tip */}
        <div className="relative z-10 mt-4 rounded-2xl border border-violet-100/40 bg-gradient-to-br from-violet-50/60 to-purple-50/40 px-3 py-3 text-xs text-muted-foreground backdrop-blur-sm">
          <p className="font-medium text-foreground">Smarter over time</p>
          <p className="mt-1 leading-relaxed">
            Recommendations improve as you add spending data and update your profile.
          </p>
        </div>
      </div>
    </div>
  )
}
