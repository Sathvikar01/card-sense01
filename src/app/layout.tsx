import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { MotionProvider } from '@/components/shared/motion-provider'
import { SITE_URL } from '@/lib/site-url'
import './globals.css'

const description = 'Every major Indian credit card, ranked on fees, rewards and eligibility for the way you spend.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'CardSense: find the card that pays you back', template: '%s · CardSense' },
  description,
  applicationName: 'CardSense',
  // The share image is app/opengraph-image.png; Next adds it to both cards.
  openGraph: { type: 'website', siteName: 'CardSense', locale: 'en_IN', title: 'Find the card that pays you back.', description },
  twitter: { card: 'summary_large_image', title: 'Find the card that pays you back.', description },
  appleWebApp: { title: 'CardSense', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
}

// Status bar matches the page in both schemes; the keyboard resizes the layout instead of covering it.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  colorScheme: 'light',
  themeColor: '#f4f3ef',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <Toaster />
      </body>
    </html>
  )
}
