'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ArrowRight, ShieldCheck, TrendingUp, Zap, Check, Cpu, CreditCard, Calculator, Users } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { ParticleField } from '@/components/shared/particle-field'
import { CardSenseLogo, CardSenseIcon } from '@/components/shared/logo'
import { AuthModal } from '@/components/shared/auth-modal'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Catalog', href: '/cards', requiresAuth: true },
]

const valuePoints = [
  {
    title: 'AI-Powered Matching',
    description: 'Our Gemini-powered engine analyzes your spending patterns, income, and goals to find your perfect card match from 50+ options.',
    detail: 'Powered by Google Gemini',
    icon: Cpu,
    iconBg: 'from-[#b8860b] to-[#d4a017]',
    accentBorder: 'group-hover:border-[#d4a017]/30',
  },
  {
    title: 'Real Reward Math',
    description: 'See annual cashback value, fee impact, and category-wise reward breakdown before you apply. No more guesswork or misleading ads.',
    detail: 'Transparent calculations',
    icon: TrendingUp,
    iconBg: 'from-emerald-500 to-green-600',
    accentBorder: 'group-hover:border-emerald-200/80',
  },
  {
    title: 'Smart Eligibility Check',
    description: 'Avoid rejections that hurt your CIBIL score. Get matched with cards you can realistically get approved for based on your credit profile.',
    detail: 'Protects your credit score',
    icon: ShieldCheck,
    iconBg: 'from-blue-500 to-cyan-600',
    accentBorder: 'group-hover:border-blue-200/80',
  },
]

// All 20 available card IDs for the marquee
const allCardIds = [
  'hdfc-regalia-gold',
  'sbi-cashback',
  'icici-amazon-pay',
  'axis-ace',
  'hdfc-millennia',
  'sbi-simply-click',
  'idfc-first-classic',
  'idfc-first-wow',
  'amex-membership-rewards',
  'kotak-811-dream',
  'axis-myzone',
  'hdfc-diners-club-black',
  'icici-sapphiro',
  'rbl-shoprite',
  'indusind-legend',
  'au-lit',
  'hdfc-indian-oil',
  'icici-coral',
  'yes-first-preferred',
  'sbi-bpcl',
]

const steps = [
  {
    number: '01',
    title: 'Share Your Profile',
    description: 'Tell us your income, spending habits, and what matters most to you in a credit card.',
  },
  {
    number: '02',
    title: 'AI Analyzes Options',
    description: 'Our engine compares 50+ Indian cards, calculating real reward value for your specific profile.',
  },
  {
    number: '03',
    title: 'Get Matched Cards',
    description: 'Receive your top 3 picks with detailed breakdowns of fees, rewards, and annual value.',
  },
]

export default function HomePage() {
  const row1 = allCardIds.slice(0, 10)
  const row2 = allCardIds.slice(10, 20)
  const heroRef = useRef<HTMLElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [mounted, setMounted] = useState(false)
  const [authModal, setAuthModal] = useState<{ open: boolean; redirectTo: string }>({ open: false, redirectTo: '/dashboard' })

  const openAuth = (redirectTo: string) => setAuthModal({ open: true, redirectTo })
  const closeAuth = () => setAuthModal((prev) => ({ ...prev, open: false }))

  useEffect(() => {
    setMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden">
      <AuthModal open={authModal.open} onClose={closeAuth} redirectTo={authModal.redirectTo} />

      {/* ====== Header ====== */}
      <header className="relative z-50 border-b border-white/10 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CardSenseIcon size={40} />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Card<span className="text-gradient-gold">Sense</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) =>
              item.requiresAuth ? (
                <button
                  key={item.label}
                  onClick={() => openAuth(item.href)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('/dashboard')}
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              Sign In
            </button>
            <motion.button
              onClick={() => openAuth('/dashboard')}
            className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#b8860b]/25"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </header>

      <main>
        {/* ====== Hero Section ====== */}
        <motion.section ref={heroRef} style={{ opacity: heroOpacity }} className="relative overflow-hidden px-4 pb-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          {/* Mouse-following spotlight */}
          <div
            className="pointer-events-none absolute inset-0 transition-all duration-300"
            style={{
              background: mounted
                ? `radial-gradient(ellipse 600px 400px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(212, 160, 23, 0.08) 0%, transparent 70%)`
                : 'transparent',
            }}
          />

          {/* Floating background elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-[#d4a017]/20 to-transparent blur-3xl"
              animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -right-10 top-1/3 h-48 w-48 rounded-full bg-gradient-to-bl from-[#e8c04a]/20 to-transparent blur-2xl"
              animate={{ y: [0, -20, 0], scale: [1, 0.95, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/3 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-200/20 to-transparent blur-2xl"
              animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, #d4a017 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#d4a017]/20 bg-white/90 px-5 py-2.5 shadow-sm shadow-[#b8860b]/5"
              >
                <CreditCard className="h-4 w-4 text-[#b8860b]" />
                <span className="text-sm font-medium text-[#7a5500]">50+ Indian Credit Cards</span>
              </motion.div>

              {/* Title with staggered reveal */}
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="cardsense-hero-title text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
                >
                  Find the credit card that
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="cardsense-hero-title text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
                >
                  <span className="text-gradient-primary">actually fits</span> your life
                </motion.h1>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                Compare 50+ cards. See real rewards. Pick smarter.
              </motion.p>

              {/* CTA Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <motion.button
                  onClick={() => openAuth('/dashboard')}
                  className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#b8860b]/20"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4a017] to-[#e8c04a] opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative">Get Started</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </motion.button>
                <motion.button
                  onClick={() => openAuth('/cards')}
                  className="group inline-flex items-center gap-2.5 rounded-2xl border-2 border-border/60 bg-white px-8 py-4 text-base font-semibold text-foreground transition-colors hover:border-[#d4a017]/40 hover:bg-[#fdf3d7]/50"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse All Cards
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ====== Card Marquee ====== */}
        <section className="relative overflow-hidden py-3 lg:mt-8">
          {/* Left/right fade overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent sm:w-40" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent sm:w-40" />

          {/* Row 1 — scrolls left */}
          <div className="marquee-row mt">
            <div className="marquee-track marquee-left">
              {[...row1, ...row1].map((id, idx) => (
                <div key={`r1-${idx}`} className="marquee-card shrink-0">
                  <CreditCardVisual cardId={id} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right, visible on scroll */}
          <div className="marquee-row mt-25">
            <div className="marquee-track marquee-right">
              {[...row2, ...row2].map((id, idx) => (
                <div key={`r2-${idx}`} className="marquee-card shrink-0">
                  <CreditCardVisual cardId={id} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== Stats ====== */}
        <section className="relative px-4 py-14 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/40 to-transparent" />
          <div className="relative">
            <div className="section-divider mx-auto mb-12 max-w-xl" />
            <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
            {[
              { value: '50+', label: 'Indian Cards', svg: <CardIconSVG /> },
              { value: '10K+', label: 'Users Matched', svg: <UsersIconSVG /> },
              { value: '2 min', label: 'To Recommendations', svg: <SpeedIconSVG /> },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fdf3d7] to-[#fdf3d7]">
                  {stat.svg}
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          </div>
        </section>

        {/* ====== Features ====== */}
        <section id="features" className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-14 text-center"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8860b]">Why CardSense</p>
              <h2 className="cardsense-hero-title mt-3 text-3xl text-foreground lg:text-4xl">
                Built for the Indian credit card ecosystem
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Most card comparison sites show you generic lists. We run real calculations on your spending data to show exactly how much each card is worth to you.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {valuePoints.map((point, idx) => {
                const Icon = point.icon
                return (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group"
                  >
                    <motion.div
                      className={`cardsense-card h-full p-7 transition-colors ${point.accentBorder}`}
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="mb-5 flex items-center gap-4">
                        <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${point.iconBg} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-5xl font-black text-[#fdf3d7]" style={{ fontFamily: 'var(--font-display)' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                      <p className="mt-4 text-xs font-medium text-[#b8860b]/80">{point.detail}</p>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====== How It Works ====== */}
        <section id="how-it-works" className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/60 via-slate-50/40 to-transparent" />
          <div className="relative mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-14 text-center"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8860b]">How It Works</p>
              <h2 className="cardsense-hero-title mt-3 text-3xl text-foreground lg:text-4xl">
                Three steps to your ideal card
              </h2>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="relative"
                >
                  <div className="cardsense-card p-7">
                    <span className="text-4xl font-black text-gradient-gold opacity-40">{step.number}</span>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                      <ArrowRight className="h-5 w-5 text-[#d4a017]/60" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== CTA ====== */}
        <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7a5500] via-[#b8860b] to-[#8a6200] p-10 sm:p-14"
            >
              <ParticleField className="opacity-40" particleCount={20} color="rgba(255, 255, 255, 0.2)" />
              <div className="relative z-10 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">Ready to start</p>
                  <p className="cardsense-hero-title mt-3 text-3xl text-white sm:text-4xl">
                    Get your top 3 card picks
                  </p>
                  <p className="mt-2 max-w-md text-sm text-white/70">
                    Free AI-powered recommendations tailored to your Indian credit profile.
                  </p>
                </div>
                <motion.button
                  onClick={() => openAuth('/dashboard')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#7a5500] shadow-xl"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ====== Footer ====== */}
        <footer className="landing-footer px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <CardSenseLogo size="sm" />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <button onClick={() => openAuth('/cards')} className="transition-colors hover:text-foreground">Card Catalog</button>
              <button onClick={() => openAuth('/education')} className="transition-colors hover:text-foreground">Education</button>
              <button onClick={() => openAuth('/dashboard')} className="transition-colors hover:text-foreground">Sign In</button>
            </div>
            <p className="text-xs text-muted-foreground">Built with AI. Not a financial advisor.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}

/* ============================================================
   Custom SVG stat icons — built from scratch, no library icons
   ============================================================ */

function CardIconSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="#d4a017" strokeWidth="1.5" />
      <rect x="2" y="5" width="20" height="5" rx="3" fill="#d4a017" opacity="0.15" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="#d4a017" strokeWidth="1.5" />
      <rect x="5" y="13" width="6" height="2" rx="1" fill="#d4a017" opacity="0.5" />
    </svg>
  )
}

function UsersIconSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke="#d4a017" strokeWidth="1.5" />
      <path d="M2 19c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="#d4a017" strokeWidth="1.2" opacity="0.5" />
      <path d="M18 14.5c2 .5 4 2.5 4 4.5" stroke="#d4a017" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function SpeedIconSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#d4a017" strokeWidth="1.5" />
      <path d="M12 6v6l4.5 2.5" stroke="#d4a017" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" fill="#d4a017" opacity="0.4" />
    </svg>
  )
}
