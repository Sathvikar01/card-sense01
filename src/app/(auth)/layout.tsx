import { CardSenseLogo } from '@/components/shared/logo'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/60 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <CardSenseLogo size="lg" />
        </Link>

        {/* Auth Card */}
        <div className="cardsense-card rounded-2xl p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LockSVG />
          <span>Your data is secure and never shared with third parties.</span>
        </div>
      </div>
    </div>
  )
}

function LockSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-muted-foreground">
      <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
