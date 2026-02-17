'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface TopbarProps {
  onMenuClick?: () => void
  userName?: string
  userEmail?: string
}

export function Topbar({ onMenuClick, userName = 'User', userEmail = '' }: TopbarProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const displayName = userName || 'User'

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Failed to log out')
    }
  }

  const initials = displayName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="sticky top-0 z-40 px-4 pt-3 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center gap-3 rounded-2xl border border-white/30 bg-white/50 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-2xl sm:px-5">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <MenuSVG />
        </Button>

        {/* Search-like display bar (desktop) */}
        <div className="hidden flex-1 md:block">
          <div className="flex max-w-sm items-center gap-2 rounded-xl border border-border/40 bg-white/40 px-3 py-1.5">
            <SearchSVG />
            <span className="text-xs text-muted-foreground/60">Search cards, pages...</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button variant="ghost" size="icon" className="relative rounded-xl">
            <BellSVG />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white" />
          </Button>

          <div className="mx-1 h-6 w-[1px] bg-border/40" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 gap-2 rounded-full px-1.5 sm:h-11 sm:px-2"
                aria-label="Open profile menu"
              >
                <Avatar className="h-8 w-8 border-2 border-violet-200/50 ring-2 ring-violet-100/30">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{displayName.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 rounded-xl border-white/40 bg-white/80 backdrop-blur-2xl" align="end">
              <DropdownMenuLabel>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <PersonSVG />
                <span className="ml-2">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <GearSVG />
                <span className="ml-2">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogoutSVG />
                <span className="ml-2">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

/* ===== Custom SVG icons ===== */

function MenuSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SearchSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-muted-foreground/60">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="10.8" y1="10.8" x2="14" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function BellSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5C7.5 2.5 5.5 4.5 5.5 7v3l-1.2 2.4a.8.8 0 00.7 1.1h10a.8.8 0 00.7-1.1L14.5 10V7c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M8 13.5c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function PersonSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 14.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function GearSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
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
