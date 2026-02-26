'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
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
import {
  User,
  Lock,
  Shield,
  Trash2,
  LogOut,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
} from 'lucide-react'

interface SettingsClientProps {
  userId: string
  email: string
  displayName: string
  provider: string
  createdAt: string
}

const PREF_KEY = 'cardsense-preferences'

/* ─────────────────── Section wrapper ─────────────────── */
function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string
  description?: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card-premium overflow-hidden"
    >
      <div className="border-b border-border/30 bg-gradient-to-r from-transparent via-[#fdf3d7]/20 to-transparent px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#b8860b] to-[#d4a017]">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </motion.div>
  )
}

/* ─────────────────── Main component ─────────────────── */
export function SettingsClient({
  userId,
  email,
  displayName,
  provider,
  createdAt,
}: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()

  /* Password change */
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  /* Display name change */
  const [name, setName] = useState(displayName)
  const [savingName, setSavingName] = useState(false)

  /* Deleting */
  const [deleting, setDeleting] = useState(false)

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
      toast.success('Display name updated')
      router.refresh()
    }
  }

  /* ── Change password ── */
  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  /* ── Export data as CSV ── */
  const handleExportCSV = () => {
    const rows = [
      ['Field', 'Value'],
      ['User ID', userId],
      ['Email', email],
      ['Display Name', name],
      ['Exported At', new Date().toISOString()],
      ['Advisor Preferences', localStorage.getItem('cardsense-advisor-storage') || ''],
      ['Beginner Flow', localStorage.getItem('beginner-flow-storage') || ''],
      ['App Preferences', localStorage.getItem(PREF_KEY) || ''],
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cardsense-data-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported as CSV')
  }

  /* ── Export data as PDF ── */
  const handleExportPDF = () => {
    const rows = [
      ['User ID', userId],
      ['Email', email],
      ['Display Name', name],
      ['Exported At', new Date().toLocaleString('en-IN')],
    ]
    const html = `<!DOCTYPE html><html><head><title>CardSense Data Export</title>
<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#222}h1{font-size:1.4rem;margin-bottom:.5rem}
p.sub{font-size:.85rem;color:#666;margin-bottom:1.5rem}table{width:100%;border-collapse:collapse;margin-top:.5rem}
td,th{border:1px solid #ddd;padding:10px 12px;text-align:left;font-size:.85rem}th{background:#f8f4e8;font-weight:600}
tr:nth-child(even){background:#fafafa}</style></head>
<body><h1>CardSense India &mdash; Data Export</h1>
<p class="sub">Generated on ${new Date().toLocaleString('en-IN')}</p>
<table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>
${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
</tbody></table></body></html>`
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.print()
    }
    toast.success('Print dialog opened for PDF export')
  }

  /* ── Sign out ── */
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
  }

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete account')
      await supabase.auth.signOut()
      toast.success('Account deleted')
      router.push('/')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  const memberSince = new Date(createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, notifications, and app preferences
        </p>
      </div>

      {/* Account */}
      <Section title="Account" description="Update your personal information" icon={User}>
        {/* Member since */}
        <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-[#fdf3d7]/20 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-[#b8860b]" />
          <div className="flex-1 text-sm text-muted-foreground">
            Member since <span className="font-medium text-foreground">{memberSince}</span>
          </div>
          {isOAuthUser && (
            <Badge variant="outline" className="border-[#d4a017]/40 text-[0.6rem] text-[#b8860b] capitalize">
              {provider}
            </Badge>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Email address</Label>
          <Input value={email} readOnly className="bg-muted/30 text-muted-foreground" />
          {isOAuthUser && (
            <p className="text-xs text-muted-foreground">
              Email is managed by your {provider} account.
            </p>
          )}
        </div>

        {/* Display name */}
        <div className="space-y-1.5">
          <Label htmlFor="display-name" className="text-sm font-medium">Display name</Label>
          <div className="flex gap-2">
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Button
              onClick={handleSaveName}
              disabled={savingName || name.trim() === displayName}
              className="cardsense-btn-primary shrink-0"
            >
              {savingName ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Section>

      {/* Security */}
      <Section
        title="Security"
        description={isOAuthUser ? 'Your account is secured via your OAuth provider' : 'Update your password'}
        icon={Lock}
      >
        {isOAuthUser ? (
          <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground capitalize">
                Signed in with {provider}
              </p>
              <p className="text-xs text-muted-foreground">
                To update your password, visit your {provider} account settings.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto shrink-0" asChild>
              <a
                href={
                  provider === 'google'
                    ? 'https://myaccount.google.com/security'
                    : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Update your account password</p>
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showPasswords ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-sm font-medium">New password</Label>
                <Input
                  id="new-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                Passwords do not match
              </p>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={
                savingPassword ||
                !newPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 8
              }
              className="cardsense-btn-primary"
            >
              {savingPassword ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        )}
      </Section>

      {/* Privacy */}
      <Section
        title="Privacy & Data"
        description="Export your data"
        icon={Shield}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Export your data</p>
            <p className="text-xs text-muted-foreground">
              Download a copy of your CardSense data including preferences and analysis history
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              PDF
            </Button>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section
        title="Account Actions"
        description="Sign out or permanently delete your account"
        icon={Trash2}
      >
        <div className="space-y-4">
          {/* Sign out */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Sign out</p>
              <p className="text-xs text-muted-foreground">Sign out from this device</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="shrink-0 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>

          <div className="border-t border-border/40" />

          {/* Delete account */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-red-600">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your CardSense account, including all your card
                    preferences, spending history, CIBIL score records, and advisor data. This
                    action <strong>cannot be undone</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete my account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Section>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        CardSense India &middot; User ID: {userId.slice(0, 8)}…
      </p>
    </div>
  )
}
