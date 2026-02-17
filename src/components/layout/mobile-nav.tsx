'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, CreditCard, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Advisor', href: '/beginner', icon: Sparkles },
  { name: 'Cards', href: '/cards', icon: CreditCard },
  { name: 'Spending', href: '/spending', icon: TrendingUp },
  { name: 'Profile', href: '/profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden">
      <nav className="flex h-[68px] items-center justify-around rounded-2xl border border-white/30 bg-white/60 px-1 shadow-xl shadow-black/[0.05] backdrop-blur-2xl">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[0.65rem] font-medium transition-colors',
                isActive ? 'text-violet-600' : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-1 rounded-xl bg-violet-50/70"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={cn('relative z-10 h-[18px] w-[18px]', isActive ? 'text-violet-600' : 'text-muted-foreground')}
              />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
