import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Chat</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Ask about cards, rewards, eligibility, and spending strategy.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          The assistant is opened for you in the bottom-right corner on this page.
          Start with a question like:
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-foreground/90">
          <li>Which card suits INR 40,000 monthly online spending?</li>
          <li>How to optimize lounge access with low annual fees?</li>
          <li>Should I choose cashback or travel points for my profile?</li>
        </ul>
        <div className="mt-5">
          <Button asChild variant="outline">
            <Link href="/advisor">Open Guided Advisor Flow</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
