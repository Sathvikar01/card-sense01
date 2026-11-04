import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div>{children}</div>
        <nav aria-label="Legal" className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="tap hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="tap hover:text-foreground">Terms</Link>
        </nav>
      </div>
    </div>
  )
}
