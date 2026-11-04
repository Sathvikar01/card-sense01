'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/shared/google-icon'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { TurnstileWidget } from '@/components/security/turnstile-widget'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const TURNSTILE_ENABLED =
  /^(1|true|yes|on)$/i.test(process.env.NEXT_PUBLIC_ENABLE_TURNSTILE || '') &&
  Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

interface AuthModalProps {
  open: boolean
  onClose: () => void
  redirectTo?: string
}

export function AuthModal({ open, onClose, redirectTo }: AuthModalProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileWidgetNonce, setTurnstileWidgetNonce] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      setStep('form')
      setOtp(['', '', '', '', '', ''])
      setPendingEmail('')
      setTurnstileToken('')
      setTurnstileWidgetNonce(0)
      form.reset()
    }, 300)
  }, [form, onClose])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [handleClose, open])

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t)
    setStep('form')
    setOtp(['', '', '', '', '', ''])
    setTurnstileToken('')
    setTurnstileWidgetNonce((value) => value + 1)
    form.reset()
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (error) { toast.error(error.message); return }
        handleClose()
        router.push(redirectTo || '/dashboard')
        router.refresh()
      } else {
        if (TURNSTILE_ENABLED && !turnstileToken) {
          toast.error('Complete the security check')
          return
        }

        const destination = redirectTo || '/dashboard'
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            turnstileToken: TURNSTILE_ENABLED ? turnstileToken : undefined,
            redirectToPath: destination,
          }),
        })

        const responseBody = await response.json().catch(() => ({}))
        if (!response.ok) {
          toast.error(
            typeof responseBody.error === 'string' ? responseBody.error : 'Failed to create account'
          )
          if (TURNSTILE_ENABLED) {
            setTurnstileToken('')
            setTurnstileWidgetNonce((value) => value + 1)
          }
          return
        }

        setPendingEmail(data.email)
        setStep('otp')
        toast.success('Code sent')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus() }
  }

  const handleVerifyOtp = async () => {
    const token = otp.join('')
    if (token.length < 6) { toast.error('Enter all 6 digits'); return }
    setIsVerifying(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token, type: 'signup' })
      if (error) { toast.error(error.message); return }
      handleClose()
      router.push(redirectTo || '/dashboard')
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail })
    if (error) toast.error(error.message)
    else toast.success('Code sent')
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const callbackUrl = redirectTo
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        : `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })
      if (error) { toast.error(error.message); setIsGoogleLoading(false) }
    } catch {
      toast.error('An unexpected error occurred')
      setIsGoogleLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/45"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-dialog-title"
              className="relative h-[480px] max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-hidden overscroll-contain rounded-3xl bg-card text-card-foreground shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Close button */}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                Close
                </button>

              <AnimatePresence mode="wait">
                {/* ── FORM STEP ── */}
                {step === 'form' && (
                  <motion.div
                    key="form-step"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex flex-col overflow-y-auto overscroll-contain pb-8"
                  >
                    <h2 id="auth-dialog-title" className="sr-only">
                      {tab === 'login' ? 'Sign in' : 'Create account'}
                    </h2>
                    <div role="tablist" className="mx-8 mt-16 grid grid-cols-2 rounded-full bg-muted p-1">
                      {(['login', 'signup'] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="tab"
                          aria-selected={tab === value}
                          onClick={() => switchTab(value)}
                          className={`rounded-full py-1.5 text-sm font-medium transition-colors ${
                            tab === value ? 'bg-gold text-pine' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {value === 'login' ? 'Sign in' : 'Create account'}
                        </button>
                      ))}
                    </div>

                    {/* Form */}
                    <div className="px-8 pt-5 flex-1">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    spellCheck={false}
                                    autoComplete="email"
                                    disabled={isLoading || isGoogleLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                                                        autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                    disabled={isLoading || isGoogleLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {tab === 'signup' && TURNSTILE_ENABLED && (
                              <div className="rounded-lg border border-border p-2">
                              <TurnstileWidget
                                key={turnstileWidgetNonce}
                                siteKey={TURNSTILE_SITE_KEY}
                                action="signup"
                                onToken={setTurnstileToken}
                                onError={() => toast.error('Security check failed to load. Refresh and try again.')}
                              />
                            </div>
                          )}

                          {/* Fixed-height slot keeps layout stable across tabs */}
                          <div className="h-5 flex items-center justify-end">
                            {tab === 'login' && (
                              <Link
                                href="/forgot-password"
                                onClick={handleClose}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                Forgot password?
                              </Link>
                            )}
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || isGoogleLoading}
                          >
                            {isLoading
                              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
                              : (tab === 'login' ? 'Sign in' : 'Create account')}
                          </Button>
                        </form>
                      </Form>

                      {/* Divider */}
                      <p className="my-1 text-center text-xs text-muted-foreground">or</p>

                      <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                      >
                        <GoogleIcon />
                        {isGoogleLoading ? 'Connecting…' : 'Continue with Google'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── OTP STEP ── */}
                {step === 'otp' && (
                  <motion.div
                    key="otp-step"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex flex-col items-center overflow-y-auto overscroll-contain px-8 pb-8 pt-8"
                  >
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                      Back
                      </button>

                    <h2 className="mt-10 text-xl font-semibold text-foreground">Check your email</h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">{pendingEmail}</p>

                    {/* OTP inputs */}
                    <div className="mt-8 flex gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el }}
                          type="text"
                          name={`verification-code-${i + 1}`}
                          aria-label={`Verification code digit ${i + 1}`}
                          autoComplete={i === 0 ? 'one-time-code' : 'off'}
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="h-14 w-11 rounded-xl bg-muted text-center text-xl font-semibold text-foreground"
                        />
                      ))}
                    </div>

                    <Button
                      className="mt-7 w-full"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || otp.join('').length < 6}
                    >
                      {isVerifying ? 'Verifying…' : 'Verify'}
                    </Button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="mt-5 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Resend code
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
