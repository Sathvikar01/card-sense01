'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/page-header'
import { Section } from '@/components/shared/section'
import { clearPrivateClientData, readPrivateClientData } from '@/lib/privacy/client-data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface SettingsClientProps {
  email: string
  displayName: string
  provider: string
}

function Row({ label, children }: { label: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="row min-h-14 flex-wrap justify-between">
      <div className="text-sm">{label}</div>
      {children}
    </div>
  )
}

/* ─────────────────── Main component ─────────────────── */
export function SettingsClient({
  email,
  displayName,
  provider,
}: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  /* Password change */
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  /* Display name change */
  const [name, setName] = useState(displayName)
  const [savingName, setSavingName] = useState(false)

  /* Deleting */
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const isOAuthUser = provider !== 'email'

  /* ── Update display name ── */
  const handleSaveName = async () => {
    if (!name.trim()) return
    setSavingName(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    })
    setSavingName(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Saved')
      router.refresh()
    }
  }

  /* ── Change password ── */
  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords don’t match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Use at least 8 characters')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  /* ── Export data as CSV ── */
  const handleExportData = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/account/export', { cache: 'no-store' })
      const serverData = await response.json()
      if (!response.ok) {
        throw new Error(serverData.error || 'Unable to export your data')
      }

      const exportData = { ...serverData, browserData: readPrivateClientData() }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cardsense-data-export-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to export your data')
    } finally {
      setExporting(false)
    }
  }

  /* ── Sign out ── */
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearPrivateClientData()
    router.push('/')
  }

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Failed to delete account')
      await supabase.auth.signOut()
      clearPrivateClientData()
      router.push('/')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="space-y-8">
        <Section title="Account">
          <Row label="Email">
            <span className="text-sm text-muted-foreground">{email}</span>
          </Row>
          <form
            className="flex flex-col gap-2 px-4 pb-3 pt-2 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault()
              void handleSaveName()
            }}
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="display-name">Name</Label>
              <Input id="display-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit" variant="outline" disabled={savingName || name.trim() === displayName}>
              {savingName ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </Section>

        <Section title="Password">
          {isOAuthUser ? (
            <Row label={<span className="capitalize">Signed in with {provider}</span>} />
          ) : (
            <form
              className="space-y-3 px-4 py-3"
              onSubmit={(e) => {
                e.preventDefault()
                void handleChangePassword()
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  name="new-password"
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  name="confirm-password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(confirmPassword) && newPassword !== confirmPassword}
                />
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={savingPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                >
                  {savingPassword ? 'Updating…' : 'Update'}
                </Button>
              </div>
            </form>
          )}
        </Section>

        <Section title="Data">
          <Row label="Export">
            <Button variant="outline" size="sm" onClick={handleExportData} disabled={exporting}>
              {exporting ? 'Preparing…' : 'Download'}
            </Button>
          </Row>
          <Row label="Sign out">
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </Row>
          <Row label="Delete account">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your profile, cards, spending and recommendations will be erased. This can’t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Row>
        </Section>
      </div>
    </div>
  )
}
