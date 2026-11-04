import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import { MotionProvider } from '@/components/shared/motion-provider'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'CardSense', template: '%s · CardSense' },
  description: 'Find the right Indian credit card for how you spend.',
}

// Status bar matches the page in both schemes; the keyboard resizes the layout instead of covering it.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f3ef' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1714' },
  ],
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
