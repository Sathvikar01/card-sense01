/** The app's five destinations. Desktop navbar and mobile tab bar both read this. */
export const NAV_ITEMS = [
  { name: 'Home', href: '/dashboard' },
  { name: 'Advisor', href: '/advisor' },
  { name: 'Cards', href: '/cards' },
  { name: 'Spending', href: '/spending' },
  { name: 'Learn', href: '/education' },
] as const

export function isActivePath(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(href + '/'))
}
