'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)

  useEffect(() => {
    let active = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setHasRecoverySession(Boolean(data.session))
    }

    init()
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoverySession(true)
        return
      }
      setHasRecoverySession(Boolean(session))
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Password updated successfully. Please sign in.')
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      toast.error('Could not update password right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Set new password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a new password for your CardSense account.
        </p>
      </div>

      {!hasRecoverySession && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          This reset link may be expired. Request a new one from{' '}
          <Link href="/forgot-password" className="font-semibold underline">
            forgot password
          </Link>
          .
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !hasRecoverySession}
        >
          {isSubmitting ? 'Updating...' : 'Update password'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Back to{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          sign in
        </Link>
      </p>
    </div>
  )
}
