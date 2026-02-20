'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CardSenseIcon } from '@/components/shared/logo'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardSVG },
  { name: 'Smart Advisor', href: '/advisor', icon: BrainNavSVG },
  { name: 'Browse Cards', href: '/cards', icon: CardNavSVG },
  { name: 'Spending Tracker', href: '/spending', icon: ChartNavSVG },
  { name: 'Education', href: '/education', icon: BookNavSVG },
  { name: 'Chat', href: '/chat', icon: ChatNavSVG },
  { name: 'Profile', href: '/profile', icon: PersonNavSVG },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:p-3">
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 bg-white/50 px-4 pb-4 pt-5 shadow-xl shadow-black/[0.03] backdrop-blur-2xl">
        {/* Gradient glow at top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#d4a017]/8 via-[#e8c04a]/4 to-transparent"
        />

        {/* Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-3 rounded-xl px-2 py-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CardSenseIcon size={44} />
          </motion.div>
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">
              Card<span className="text-gradient-gold">Sense</span>
            </p>
            <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">India Advisor</p>
          </div>
        </Link>

        {/* Divider */}
        <div className="relative z-10 mx-2 mt-5 h-[1px] bg-gradient-to-r from-transparent via-border/60 to-transparent" />

        {/* Navigation */}
        <nav className="relative z-10 mt-5 flex-1 space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const IconComp = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                data-active={isActive ? 'true' : 'false'}
                className={cn(
                  'cardsense-nav-item group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium',
                  isActive ? 'text-[#b8860b]' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className={cn(
                  'mr-3 shrink-0 transition-colors duration-200',
                  isActive ? 'text-[#b8860b]' : 'text-muted-foreground group-hover:text-foreground'
                )}>
                  <IconComp active={isActive} />
                </span>
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <>
                    <ChevronRight className="h-3.5 w-3.5 text-[#b8860b]/50" />
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-xl border border-[#d4a017]/30 bg-[#fdf3d7]/50"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom tip */}
        <div className="relative z-10 mt-4 overflow-hidden rounded-2xl border border-[#d4a017]/20 bg-gradient-to-br from-[#fdf3d7]/60 to-[#fdf3d7]/40 px-4 py-3.5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" fill="white" opacity="0.9" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Smarter over time</p>
              <p className="mt-0.5 text-[0.68rem] leading-relaxed text-muted-foreground">
                Add spending data for sharper card matches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== Custom nav SVG icons ===== */

function DashboardSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="10" y="1" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="10" y="7" width="7" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
    </svg>
  )
}

function WandNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11.5 2l5 5-12.5 12.5L-.5 14 11.5 2z" stroke="currentColor" strokeWidth="1.4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} transform="scale(0.85) translate(1.5,1)" />
      <path d="M13 1l.8 2 2 .8-2 .8L13 6.6l-.8-2-2-.8 2-.8z" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function BrainNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 3C7.3 3 5.8 3.9 5.1 5.3 3.4 5.6 2 7.1 2 9c0 1.5.8 2.8 2 3.5 0 .3-.1.6-.1.9C3.9 15.3 5.4 17 7.4 17h3.2c2 0 3.5-1.7 3.5-3.6 0-.3 0-.6-.1-.9 1.2-.7 2-2 2-3.5 0-1.9-1.4-3.4-3.1-3.7C12.2 3.9 10.7 3 9 3z" stroke="currentColor" strokeWidth="1.3" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
      <path d="M9 6.5v6M7 9h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

function CardNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="4" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
      <line x1="1.5" y1="7.5" x2="16.5" y2="7.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="4" y="10" width="4" height="1.5" rx="0.75" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

function ChartNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 15h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="3" y="8" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="7.5" y="4" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="12" y="6" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
    </svg>
  )
}

function BookNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 3h5.5c.8 0 1.5.7 1.5 1.5V15l-.1-.1C8.1 14.3 7 14 6 14H2V3z" stroke="currentColor" strokeWidth="1.3" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
      <path d="M16 3h-5.5c-.8 0-1.5.7-1.5 1.5V15l.1-.1c.8-.6 1.9-.9 2.9-.9H16V3z" stroke="currentColor" strokeWidth="1.3" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
    </svg>
  )
}

function ChatNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15 2H3a1.5 1.5 0 00-1.5 1.5v8.5A1.5 1.5 0 003 13.5h2v2.5l3.5-2.5H15a1.5 1.5 0 001.5-1.5V3.5A1.5 1.5 0 0015 2z" stroke="currentColor" strokeWidth="1.3" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} strokeLinejoin="round" />
      <path d="M5.5 7h7M5.5 9.5h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function PersonNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
      <path d="M2.5 16.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
