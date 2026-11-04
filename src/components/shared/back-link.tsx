import Link from 'next/link'

/** A quiet text link back to the parent list. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-6 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground">
      {children}
    </Link>
  )
}
