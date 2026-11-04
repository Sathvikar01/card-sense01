'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Logo } from '@/components/shared/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { clearPrivateClientData } from '@/lib/privacy/client-data'
import { NAV_ITEMS, isActivePath } from './nav-items'
import { NavLink } from './nav-link'

interface NavbarProps {
  userName?: string
  userEmail?: string
}

export function Navbar({ userName = 'User', userEmail = '' }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      clearPrivateClientData()
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Unable to log out. Check your connection and try again.')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-10 px-4 sm:px-6">
        <Link href="/dashboard" aria-label="CardSense home" className="flex">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden h-full items-stretch gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} active={isActivePath(pathname, item.href)} className="text-sm">
              {item.name}
            </NavLink>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account"
            className="tap ml-auto rounded-full"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="px-2 pb-2 pt-1.5 font-normal">
              <p className="truncate text-sm font-medium">{userName}</p>
              {userEmail && <p className="truncate text-xs text-muted-foreground">{userEmail}</p>}
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/chat">Ask AI</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
