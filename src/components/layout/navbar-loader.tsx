'use client'

import dynamic from 'next/dynamic'

const NavbarClient = dynamic(
  () => import('./navbar').then((mod) => mod.Navbar),
  { ssr: false }
)

export function NavbarLoader(props: { userName?: string; userEmail?: string }) {
  return <NavbarClient {...props} />
}
