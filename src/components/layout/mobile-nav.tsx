'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: HomeMobileSVG },
  { name: 'Advisor', href: '/advisor', icon: WandMobileSVG },
  { name: 'Cards', href: '/cards', icon: CardMobileSVG },
  { name: 'Spend', href: '/spending', icon: ChartMobileSVG },
  { name: 'Profile', href: '/profile', icon: PersonMobileSVG },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:hidden">
      <nav className="flex h-[72px] items-center justify-around rounded-2xl border border-white/30 bg-white/70 px-2 shadow-xl shadow-black/[0.05] backdrop-blur-2xl">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const IconComp = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex h-full flex-1 flex-col items-center justify-center gap-1.5 rounded-xl text-[0.6rem] font-semibold transition-colors',
                isActive ? 'text-[#b8860b]' : 'text-muted-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-1.5 rounded-xl bg-[#fdf3d7]/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                <IconComp active={isActive} />
              </span>
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-[#d4a017]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

/* ===== Custom mobile nav SVG icons ===== */

function HomeMobileSVG({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 10l7-7 7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9v6a2 2 0 002 2h6a2 2 0 002-2V9"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={active ? 'currentColor' : 'none'}
        opacity={active ? 0.12 : 1}
      />
    </svg>
  )
}

function WandMobileSVG({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M12 3l5.5 5.5L5.5 20.5l-5-1L12 3z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill={active ? 'currentColor' : 'none'}
        opacity={active ? 0.12 : 1}
        transform="scale(0.8) translate(2.5,1)"
      />
      <path d="M14.5 1.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function CardMobileSVG({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2" y="4.5" width="16" height="11" rx="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        fill={active ? 'currentColor' : 'none'}
        opacity={active ? 0.12 : 1}
      />
      <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5" y="11" width="4" height="1.5" rx="0.75" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

function ChartMobileSVG({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 16.5h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="3.5" y="9" width="3.5" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="8.25" y="4.5" width="3.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="13" y="6.5" width="3.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
    </svg>
  )
}

function PersonMobileSVG({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle
        cx="10" cy="7" r="3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        fill={active ? 'currentColor' : 'none'}
        opacity={active ? 0.12 : 1}
      />
      <path
        d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
