'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CardSenseIcon } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

/* ===== Navigation data ===== */

const mainNav = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Browse Cards', href: '/cards' },
  { name: 'Spending', href: '/spending' },
  { name: 'Education', href: '/education' },
]

const mobileNav = [
  { name: 'Dashboard', href: '/dashboard', icon: DashboardSVG },
  { name: 'Advisor', href: '/advisor', icon: BrainNavSVG },
  { name: 'Browse Cards', href: '/cards', icon: CardNavSVG },
  { name: 'Spending', href: '/spending', icon: ChartNavSVG },
  { name: 'Education', href: '/education', icon: BookNavSVG },
  { name: 'AI Chat', href: '/chat', icon: ChatNavSVG },
  { name: 'Profile', href: '/profile', icon: PersonNavSVG },
  { name: 'Settings', href: '/settings', icon: GearNavSVG },
]

/* ===== Main Navbar Component ===== */

interface NavbarProps {
  userName?: string
  userEmail?: string
}

export function Navbar({ userName = 'User', userEmail = '' }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = userName || 'User'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const isAdvisorActive = pathname?.startsWith('/advisor')

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-border/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CardSenseIcon size={34} />
            </motion.div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Card<span className="text-gradient-gold">Sense</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive ? 'true' : 'false'}
                  className={cn(
                    'cardsense-navbar-link relative px-3 py-2',
                    isActive && 'text-[#b8860b]'
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-indicator"
                      className="absolute inset-x-1 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4a017]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* Advisor link */}
            <Link
              href="/advisor"
              data-active={isAdvisorActive ? 'true' : 'false'}
              className={cn(
                'cardsense-navbar-link relative px-3 py-2',
                isAdvisorActive && 'text-[#b8860b]'
              )}
            >
              Advisor
              {isAdvisorActive && (
                <motion.div
                  layoutId="navbar-active-indicator"
                  className="absolute inset-x-1 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4a017]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </nav>

          {/* Right section */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 rounded-full px-1.5 sm:h-11 sm:px-2"
                  aria-label="Open profile menu"
                >
                  <Avatar className="h-8 w-8 border-2 border-[#d4a017]/40 ring-2 ring-[#d4a017]/15">
                    <AvatarImage src="" alt={displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-[#b8860b] to-[#d4a017] text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground sm:inline">{displayName.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 rounded-xl border-border/40 bg-white/90 backdrop-blur-2xl" align="end">
                <DropdownMenuLabel>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                  <PersonNavSVG />
                  <span className="ml-2">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                  <SettingsNavSVG />
                  <span className="ml-2">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogoutSVG />
                  <span className="ml-2">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile hamburger */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <MenuSVG />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sheet menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-80 overflow-y-auto border-r-border/30 bg-white/95 p-0 backdrop-blur-2xl">
          <SheetHeader className="border-b border-border/30 px-5 py-4">
            <SheetTitle asChild>
              <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <CardSenseIcon size={34} />
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Card<span className="text-gradient-gold">Sense</span>
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 px-3 py-4">
            {mobileNav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const IconComp = item.icon
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#fdf3d7]/70 text-[#b8860b]'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    )}
                  >
                    <span className={cn('shrink-0', isActive ? 'text-[#b8860b]' : 'text-muted-foreground')}>
                      <IconComp active={isActive} />
                    </span>
                    {item.name}
                  </Link>
                </SheetClose>
              )
            })}
          </nav>

          {/* Bottom tip */}
          <div className="mt-auto border-t border-border/30 p-4">
              <div className="overflow-hidden rounded-2xl border border-[#d4a017]/20 bg-gradient-to-br from-[#fdf3d7]/60 to-[#fdf3d7]/40 px-4 py-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017]">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" stroke="white" strokeWidth="1.2" fill="none" />
                    <path d="M5 8h6M5 5.5h6M5 10.5h3" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
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
        </SheetContent>
      </Sheet>
    </header>
  )
}

/* ===== Custom SVG icons (ported from sidebar + topbar) ===== */

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

function MenuSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function GearNavSVG({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 1} />
      <path d="M14.6 11.15l1 .58a.56.56 0 01.2.77l-1.12 1.95a.56.56 0 01-.77.2l-1-.58c-.37.3-.78.55-1.23.72v1.17a.56.56 0 01-.56.56h-2.24a.56.56 0 01-.56-.56v-1.17c-.45-.17-.86-.42-1.23-.72l-1 .58a.56.56 0 01-.77-.2L4.2 12.5a.56.56 0 01.2-.77l1-.58a5.06 5.06 0 010-1.42l-1-.58a.56.56 0 01-.2-.77l1.12-1.95a.56.56 0 01.77-.2l1 .58c.37-.3.78-.55 1.23-.72V4.92a.56.56 0 01.56-.56h2.24c.31 0 .56.25.56.56v1.17c.45.17.86.42 1.23.72l1-.58a.56.56 0 01.77.2l1.12 1.95a.56.56 0 01-.2.77l-1 .58a5.06 5.06 0 010 1.42z" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function SettingsNavSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13.05 10.13l.9.52a.5.5 0 01.18.68l-1 1.74a.5.5 0 01-.68.18l-.9-.52a4.47 4.47 0 01-1.1.64v1.04a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-1.04a4.47 4.47 0 01-1.1-.64l-.9.52a.5.5 0 01-.68-.18l-1-1.74a.5.5 0 01.18-.68l.9-.52a4.5 4.5 0 010-1.26l-.9-.52a.5.5 0 01-.18-.68l1-1.74a.5.5 0 01.68-.18l.9.52a4.47 4.47 0 011.1-.64V4.59a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1.04c.4.16.77.37 1.1.64l.9-.52a.5.5 0 01.68.18l1 1.74a.5.5 0 01-.18.68l-.9.52a4.5 4.5 0 010 1.26z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function LogoutSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10.5 11.5L14 8l-3.5-3.5M5.5 8h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
