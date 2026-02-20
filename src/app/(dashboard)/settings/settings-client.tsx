'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
  Bell,
  Shield,
  Trash2,
  LogOut,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

interface SettingsClientProps {
  userId: string
  email: string
  displayName: string
  provider: string
  createdAt: string
}

const PREF_KEY = 'cardsense-preferences'

function loadPrefs() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePrefs(prefs: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
}

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

/* ─────────────────── Row toggle ─────────────────── */
function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
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
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  /* Display name change */
  const [name, setName] = useState(displayName)
  const [savingName, setSavingName] = useState(false)

  /* Notification prefs (local) */
  const [notifyRecommendations, setNotifyRecommendations] = useState(true)
  const [notifySpendingAlerts, setNotifySpendingAlerts] = useState(true)
  const [notifyEducation, setNotifyEducation] = useState(false)
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(true)

  /* Privacy prefs */
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  /* Deleting */
  const [deleting, setDeleting] = useState(false)

  const isOAuthUser = provider !== 'email'

  /* Load preferences from localStorage */
  useEffect(() => {
    const prefs = loadPrefs()
    if ('notifyRecommendations' in prefs) setNotifyRecommendations(prefs.notifyRecommendations)
    if ('notifySpendingAlerts' in prefs) setNotifySpendingAlerts(prefs.notifySpendingAlerts)
    if ('notifyEducation' in prefs) setNotifyEducation(prefs.notifyEducation)
    if ('notifyProductUpdates' in prefs) setNotifyProductUpdates(prefs.notifyProductUpdates)
    if ('analyticsEnabled' in prefs) setAnalyticsEnabled(prefs.analyticsEnabled)
  }, [])

  /* Persist notification/privacy prefs */
  const updatePref = (key: string, value: boolean) => {
    const prefs = loadPrefs()
    prefs[key] = value
    savePrefs(prefs)
  }

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
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  /* ── Export data ── */
  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      userId,
      email,
      displayName: name,
      advisorPreferences: localStorage.getItem('cardsense-advisor-storage'),
      beginnerFlow: localStorage.getItem('beginner-flow-storage'),
      appPreferences: localStorage.getItem(PREF_KEY),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cardsense-data-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data exported successfully')
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

      {/* Notifications */}
      <Section
        title="Notifications"
        description="Choose what you want to be notified about"
        icon={Bell}
      >
        <div className="space-y-5">
          <ToggleRow
            label="Card recommendations"
            description="Get notified when new personalised card recommendations are available"
            checked={notifyRecommendations}
            onCheckedChange={(v) => {
              setNotifyRecommendations(v)
              updatePref('notifyRecommendations', v)
            }}
          />
          <Separator />
          <ToggleRow
            label="Spending alerts"
            description="Alerts when your spending crosses budget thresholds"
            checked={notifySpendingAlerts}
            onCheckedChange={(v) => {
              setNotifySpendingAlerts(v)
              updatePref('notifySpendingAlerts', v)
            }}
          />
          <Separator />
          <ToggleRow
            label="Education articles"
            description="Weekly curated finance tips and card strategy articles"
            checked={notifyEducation}
            onCheckedChange={(v) => {
              setNotifyEducation(v)
              updatePref('notifyEducation', v)
            }}
          />
          <Separator />
          <ToggleRow
            label="Product updates"
            description="New features, improvements and important announcements"
            checked={notifyProductUpdates}
            onCheckedChange={(v) => {
              setNotifyProductUpdates(v)
              updatePref('notifyProductUpdates', v)
            }}
          />
        </div>
      </Section>

      {/* Privacy */}
      <Section
        title="Privacy & Data"
        description="Control how your data is used"
        icon={Shield}
      >
        <div className="space-y-5">
          <ToggleRow
            label="Usage analytics"
            description="Help us improve CardSense by sharing anonymous usage data"
            checked={analyticsEnabled}
            onCheckedChange={(v) => {
              setAnalyticsEnabled(v)
              updatePref('analyticsEnabled', v)
            }}
          />

          <Separator />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Export your data</p>
              <p className="text-xs text-muted-foreground">
                Download a copy of your CardSense data including preferences and analysis history
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="shrink-0 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export
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

          <Separator />

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
