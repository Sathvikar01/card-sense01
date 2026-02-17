'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, Zap, Check, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { ParticleField } from '@/components/shared/particle-field'
import { CardSenseLogo, CardSenseIcon } from '@/components/shared/logo'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Catalog', href: '/cards' },
]

const valuePoints = [
  {
    title: 'AI-Powered Matching',
    description: 'Our Gemini-powered engine analyzes your spending patterns, income, and goals to find your perfect card match.',
    icon: Sparkles,
    iconBg: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Real Reward Math',
    description: 'See annual value, fee impact, and category-wise reward breakdown before you apply. No guesswork.',
    icon: TrendingUp,
    iconBg: 'from-emerald-500 to-green-600',
  },
  {
    title: 'Smart Eligibility',
    description: 'Avoid rejections. Get cards you can realistically get approved for based on your CIBIL score and profile.',
    icon: ShieldCheck,
    iconBg: 'from-blue-500 to-cyan-600',
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
  // Split cards into two rows for counter-scrolling marquees
  const row1 = allCardIds.slice(0, 10)
  const row2 = allCardIds.slice(10, 20)

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ====== Header ====== */}
      <header className="relative z-50 border-b border-white/10 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CardSenseIcon size={40} />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Card<span className="text-gradient-primary">Sense</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex">
              Sign In
            </Link>
            <Link href="/signup">
              <motion.div
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ====== Hero Section ====== */}
        <section className="relative px-4 pb-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="ambient-orb left-[10%] top-[5%] h-[500px] w-[500px] bg-violet-400/20" />
            <div className="ambient-orb right-[5%] top-[15%] h-[400px] w-[400px] bg-purple-400/15" style={{ animationDelay: '-7s' }} />
            <div className="ambient-orb bottom-[5%] left-[40%] h-[350px] w-[350px] bg-blue-400/10" style={{ animationDelay: '-14s' }} />
            <ParticleField className="opacity-20" particleCount={25} />
          </div>

          <div className="relative mx-auto max-w-7xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/80 px-4 py-1.5 backdrop-blur-sm"
            >
              <Zap className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-xs font-semibold tracking-wide text-violet-700">AI-Powered Credit Card Intelligence</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="cardsense-hero-title mx-auto mt-6 max-w-4xl text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl"
            >
              Your money deserves the{' '}
              <span className="text-gradient-primary">smartest card</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              AI advisor that matches you with the best Indian credit cards. Real reward math. Zero guesswork.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/signup">
                <motion.div
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/25"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get My Card Picks
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              </Link>
              <Link href="/cards">
                <motion.div
                  className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-white/60 px-8 py-4 text-base font-semibold text-foreground backdrop-blur-sm"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse 50+ Cards
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-6"
            >
              {['Free forever', 'No credit check', 'Instant results'].map((text) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ====== Card Marquee — Two Rows ====== */}
        <section className="relative mt-10 overflow-hidden py-6 lg:mt-14">
          {/* Left/right fade overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent sm:w-40" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent sm:w-40" />

          {/* Row 1 — scrolls left */}
          <div className="marquee-row mb-5">
            <div className="marquee-track marquee-left">
              {[...row1, ...row1].map((id, idx) => (
                <div key={`r1-${idx}`} className="marquee-card shrink-0">
                  <CreditCardVisual cardId={id} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right */}
          <div className="marquee-row">
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
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50">
                  {stat.svg}
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Why CardSense</p>
              <h2 className="cardsense-hero-title mt-3 text-3xl text-foreground lg:text-4xl">
                Built for the Indian credit card ecosystem
              </h2>
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
                  >
                    <motion.div
                      className="cardsense-card h-full p-7"
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${point.iconBg} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{point.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====== How It Works ====== */}
        <section id="how-it-works" className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-14 text-center"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">How It Works</p>
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
                    <span className="text-4xl font-black text-gradient-primary opacity-40">{step.number}</span>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                      <ArrowRight className="h-5 w-5 text-violet-300" />
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
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-10 sm:p-14"
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
                <Link href="/signup">
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-violet-700 shadow-xl"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ====== Footer ====== */}
        <footer className="landing-footer px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            <CardSenseLogo size="sm" />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/cards" className="transition-colors hover:text-foreground">Card Catalog</Link>
              <Link href="/education" className="transition-colors hover:text-foreground">Education</Link>
              <Link href="/login" className="transition-colors hover:text-foreground">Sign In</Link>
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
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="#7c3aed" strokeWidth="1.5" />
      <rect x="2" y="5" width="20" height="5" rx="3" fill="#7c3aed" opacity="0.15" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="#7c3aed" strokeWidth="1.5" />
      <rect x="5" y="13" width="6" height="2" rx="1" fill="#7c3aed" opacity="0.5" />
    </svg>
  )
}

function UsersIconSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke="#7c3aed" strokeWidth="1.5" />
      <path d="M2 19c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.5" stroke="#7c3aed" strokeWidth="1.2" opacity="0.5" />
      <path d="M18 14.5c2 .5 4 2.5 4 4.5" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function SpeedIconSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#7c3aed" strokeWidth="1.5" />
      <path d="M12 6v6l4.5 2.5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" fill="#7c3aed" opacity="0.4" />
    </svg>
  )
}
