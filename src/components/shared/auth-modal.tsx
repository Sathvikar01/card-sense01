'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
import { CardSenseIcon } from '@/components/shared/logo'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

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
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const supabase = createClient()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setStep('form')
      setOtp(['', '', '', '', '', ''])
      setPendingEmail('')
      form.reset()
    }, 300)
  }

  const switchTab = (t: 'login' | 'signup') => {
    setTab(t)
    setStep('form')
    setOtp(['', '', '', '', '', ''])
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
        toast.success('Signed in!')
        handleClose()
        router.push(redirectTo || '/dashboard')
        router.refresh()
      } else {
        const destination = redirectTo || '/dashboard'
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
          },
        })
        if (error) { toast.error(error.message); return }
        setPendingEmail(data.email)
        setStep('otp')
        toast.success('A 6-digit code has been sent to your email.')
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
    if (token.length < 6) { toast.error('Please enter the full 6-digit code'); return }
    setIsVerifying(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token, type: 'signup' })
      if (error) { toast.error(error.message); return }
      toast.success('Email verified! Welcome to CardSense.')
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
    else toast.success('Code resent!')
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
          queryParams: { access_type: 'offline', prompt: 'consent' },
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
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
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
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl shadow-black/20 dark:bg-gray-950 overflow-hidden"
              style={{ height: '580px' }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              >
                <X className="h-4 w-4" />
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
                    className="absolute inset-0 flex flex-col"
                  >
                    {/* Header */}
                    <div className="px-8 pb-0 pt-8 text-center">
                      <div className="mx-auto mb-3 flex justify-center">
                        <CardSenseIcon size={48} />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {tab === 'login' ? 'Welcome back' : 'Create your account'}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500 leading-snug">
                        {tab === 'login'
                          ? 'Sign in to access your card recommendations'
                          : 'Get started with AI-powered card matching'}
                      </p>
                    </div>

                    {/* Tab switcher */}
                    <div className="mx-8 mt-5 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                      <button
                        onClick={() => switchTab('login')}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                          tab === 'login'
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => switchTab('signup')}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                          tab === 'signup'
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        Sign Up
                      </button>
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
                                    placeholder={tab === 'login' ? 'Enter your password' : 'Create a password'}
                                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                    disabled={isLoading || isGoogleLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Fixed-height slot keeps layout stable across tabs */}
                          <div className="h-5 flex items-center justify-end">
                            {tab === 'login' && (
                              <Link
                                href="/forgot-password"
                                onClick={handleClose}
                                className="text-xs text-violet-600 hover:text-violet-500"
                              >
                                Forgot password?
                              </Link>
                            )}
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
                            disabled={isLoading || isGoogleLoading}
                          >
                            {isLoading
                              ? (tab === 'login' ? 'Signing in...' : 'Creating account...')
                              : (
                                <span className="flex items-center gap-2">
                                  {tab === 'login' ? 'Sign in' : 'Create account'}
                                  <ArrowRight className="h-4 w-4" />
                                </span>
                              )}
                          </Button>
                        </form>
                      </Form>

                      {/* Divider */}
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-400 dark:bg-gray-950">Or continue with</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
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
                    className="absolute inset-0 flex flex-col items-center px-8 pt-8"
                  >
                    {/* Back button */}
                    <button
                      onClick={() => setStep('form')}
                      className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100">
                      <Mail className="h-7 w-7 text-violet-600" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check your email</h2>
                    <p className="mt-2 text-center text-sm text-gray-500 max-w-xs">
                      We sent a 6-digit code to<br />
                      <span className="font-semibold text-gray-700">{pendingEmail}</span>
                    </p>

                    {/* OTP inputs */}
                    <div className="mt-8 flex gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="h-14 w-11 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-xl font-bold text-gray-900 focus:border-violet-500 focus:outline-none focus:bg-white transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      ))}
                    </div>

                    <Button
                      className="mt-7 w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500"
                      onClick={handleVerifyOtp}
                      disabled={isVerifying || otp.join('').length < 6}
                    >
                      {isVerifying ? 'Verifying...' : (
                        <span className="flex items-center gap-2">
                          Verify &amp; continue
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>

                    <p className="mt-5 text-sm text-gray-500">
                      Didn&apos;t receive it?{' '}
                      <button
                        onClick={handleResendOtp}
                        className="font-medium text-violet-600 hover:text-violet-500"
                      >
                        Resend code
                      </button>
                    </p>

                    <p className="mt-3 text-xs text-gray-400 text-center max-w-xs">
                      The code expires in 10 minutes. Check your spam folder if you don&apos;t see it.
                    </p>
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
