'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, LogOut, Settings, User } from 'lucide-react'
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
      <div className="cardsense-panel flex h-16 items-center gap-3 rounded-2xl border px-3 sm:px-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>

        <div className="hidden min-w-0 flex-1 md:block">
          <p className="truncate text-sm font-medium text-foreground">Welcome, {displayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            Keep profile and spending updated for sharper card recommendations.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 rounded-full px-0 sm:h-11 sm:px-1"
                aria-label="Open profile menu"
              >
                <Avatar className="h-9 w-9 border border-border/70">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end">
              <DropdownMenuLabel>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
