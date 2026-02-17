'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, CreditCard, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <nav className="cardsense-panel flex h-16 items-center justify-around rounded-2xl border px-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.68rem] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon
                className={cn('h-[18px] w-[18px]', isActive ? 'text-primary' : 'text-muted-foreground')}
              />
              {item.name}
              {isActive && (
                <span className="absolute bottom-1.5 h-[3px] w-4 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
