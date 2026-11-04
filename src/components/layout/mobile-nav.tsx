'use client'

import { usePathname } from 'next/navigation'
import { NAV_ITEMS, isActivePath } from './nav-items'
import { NavLink } from './nav-link'

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="flex h-14">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} href={item.href} active={isActivePath(pathname, item.href)} className="flex-1 text-[13px]">
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
