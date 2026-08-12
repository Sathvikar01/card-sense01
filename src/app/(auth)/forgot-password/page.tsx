'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ensureSupabaseAuthReachable } from '@/lib/supabase/connectivity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    try {
      const connectivity = await ensureSupabaseAuthReachable()
      if (!connectivity.ok) {
        toast.error(connectivity.message)
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Password reset link sent. Check your email.')
    } catch {
      toast.error('Could not send reset link right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your account email and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={isSubmitting}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
