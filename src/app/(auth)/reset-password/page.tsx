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
      toast.error('Use at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Enter the same password in both fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Password updated')
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      toast.error('Unable to update your password. Check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-center text-xl font-semibold tracking-tight">New password</h1>

      {!hasRecoverySession && (
        <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm">
          Link expired.{' '}
          <Link href="/forgot-password" className="font-medium underline underline-offset-2">
            Get a new one
          </Link>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
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
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="tap font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
