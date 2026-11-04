import { CreditCard, GraduationCap, House, PieChart, Sparkles, type LucideIcon } from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

/** The app's five destinations. Desktop navbar and mobile tab bar both read this. */
export const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: House },
  { name: 'Advisor', href: '/advisor', icon: Sparkles },
  { name: 'Cards', href: '/cards', icon: CreditCard },
  { name: 'Spending', href: '/spending', icon: PieChart },
  { name: 'Learn', href: '/education', icon: GraduationCap },
]

export function isActivePath(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(href + '/'))
}
