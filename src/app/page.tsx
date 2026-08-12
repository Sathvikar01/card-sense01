'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck, TrendingUp, Cpu, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { ParticleField } from '@/components/shared/particle-field'
import { CardSenseLogo, CardSenseIcon } from '@/components/shared/logo'
import { AuthModal } from '@/components/shared/auth-modal'

function AnimatedHero({ openAuth }: { openAuth: (path: string) => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    // Phase 0: Particles assemble into card (0 -> 1.5s)
    const t1 = setTimeout(() => setPhase(1), 1500)
    // Phase 1: Content fades in on top of card (1.5s -> 3.5s)
    const t2 = setTimeout(() => setPhase(2), 3500)
    // Phase 2: Card bursts out, content stays
    const t3 = setTimeout(() => setPhase(3), 4500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  // Generate some particles
  const particles = Array.from({ length: 60 }).map((_, i) => {
    // scattered origins
    const angle = ((i * 137.5) % 360) * Math.PI / 180
    const dist = 400 + ((i * 83) % 800)
    const startX = Math.cos(angle) * dist
    const startY = Math.sin(angle) * dist

    // target position inside the 3D card layout (simulating a grid or random inside a rect)
    const tx = (((i * 47) % 100) / 100 - 0.5) * 280
    const ty = (((i * 71) % 100) / 100 - 0.5) * 160

    return { id: i, startX, startY, tx, ty }
  })

  return (
    <div className="relative w-full h-[600px] bg-[#0a1128] overflow-hidden flex items-center justify-center pt-16 rounded-b-[3rem] shadow-2xl">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.1)_0%,transparent_60%)] pointer-events-none" />

      {/* Particles forming the 3D card */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[1000px] pointer-events-none">
        <motion.div 
          className="relative w-[340px] h-[200px]"
          animate={
            phase === 0 ? { rotateX: 60, rotateZ: -20, scale: 0.8, opacity: 1 } :
            phase === 1 ? { rotateX: 60, rotateZ: -20, scale: 1, opacity: 1 } :
            phase === 2 ? { rotateX: 0, rotateZ: 0, scale: 1.1, opacity: 1 } :
            { scale: 2, opacity: 0 } // Burst out
          }
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {/* Card Glassmorphic Background that fades in when assembled */}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-[#d4a017]/50 bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(212,160,23,0.2)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 && phase < 3 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 rounded-full bg-[#d4a017] shadow-[0_0_8px_#d4a017]"
              initial={{ x: p.startX, y: p.startY, opacity: 0 }}
              animate={
                phase === 0 ? { x: p.startX, y: p.startY, opacity: 0 } :
                phase === 1 ? { x: p.tx + 170, y: p.ty + 100, opacity: 1, scale: 0.5 + (p.id % 5) * 0.1 } :
                phase === 2 ? { x: p.tx + 170, y: p.ty + 100, opacity: 0.8, scale: 0.5 } :
                { x: p.startX * 1.5, y: p.startY * 1.5, opacity: 0, scale: 2 } // Burst out
              }
              transition={{
                duration: phase === 3 ? 1 : 1.5,
                ease: "circOut",
                delay: phase === 1 ? (p.id % 10) * 0.05 : 0
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Main Content inside the Hero - Appears on the card, stays after burst */}
      <motion.div 
        className="relative z-10 flex flex-col items-center text-center max-w-2xl px-4"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ 
          opacity: phase >= 2 ? 1 : 0, 
          y: phase >= 2 ? 0 : 30,
          scale: phase >= 3 ? 1 : 0.95
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4a017]/30 bg-white/5 px-4 py-1.5 backdrop-blur-md">
          <CreditCard className="h-4 w-4 text-[#d4a017]" />
          <span className="text-sm font-medium text-white/90">Independent Card Comparison</span>
        </motion.div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4">
          Find the credit card that
          <span className="block text-gradient-gold">actually fits</span>
          your life
        </h1>
        
        <p className="mt-4 text-lg text-white/70 sm:text-xl max-w-xl mx-auto mb-8">
          Compare fees, understand earning rules, and see estimates tailored to your spending.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => openAuth('/dashboard')}
            className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4a017] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#b8860b]/30 transition-transform hover:scale-105"
          >
            Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => openAuth('/cards')}
            className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Browse All Cards
          </button>
        </div>
      </motion.div>
    </div>
  )
}

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Catalog', href: '/cards', requiresAuth: true },
]

const valuePoints = [
  {
    title: 'Smart Matching',
    description: 'Our scoring engine uses your spending patterns, income, and goals to rank suitable cards from the available catalog.',
    detail: 'Rule-based scoring',
    icon: Cpu,
    iconBg: 'from-[#b8860b] to-[#d4a017]',
    accentBorder: 'group-hover:border-[#d4a017]/30',
  },
  {
    title: 'Transparent Reward Estimates',
    description: 'See estimated annual value, fee impact, and category rules before you apply. Issuer terms remain the final source of truth.',
    detail: 'Transparent calculations',
    icon: TrendingUp,
    iconBg: 'from-emerald-500 to-green-600',
    accentBorder: 'group-hover:border-emerald-200/80',
  },
  {
    title: 'Smart Eligibility Check',
    description: 'Focus on cards whose published requirements align with your profile. Approval always remains with the issuing bank.',
    detail: 'Eligibility guidance',
    icon: ShieldCheck,
    iconBg: 'from-blue-500 to-cyan-600',
    accentBorder: 'group-hover:border-blue-200/80',
  },
]

// A curated visual sample from the wider catalog.
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
    title: 'Engine Analyzes Options',
    description: 'Our engine compares available cards and estimates reward value for your profile.',
  },
  {
    number: '03',
    title: 'Get Matched Cards',
    description: 'Receive your top 3 picks with detailed breakdowns of fees, rewards, and annual value.',
  },
]

export default function HomePage() {
  const router = useRouter()
  const row1 = allCardIds.slice(0, 10)
  const row2 = allCardIds.slice(10, 20)
  const [authModal, setAuthModal] = useState<{ open: boolean; redirectTo: string }>({ open: false, redirectTo: '/dashboard' })

  const openAuth = (redirectTo: string) => setAuthModal({ open: true, redirectTo })
  const closeAuth = () => setAuthModal((prev) => ({ ...prev, open: false }))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    router.replace(`/auth/callback?${params.toString()}`)
  }, [router])

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

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* ====== Hero Section ====== */}
        <AnimatedHero openAuth={openAuth} />

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
              { value: 'Fees', label: 'Compared after waivers', svg: <CardIconSVG /> },
              { value: 'Profile', label: 'Used for matching', svg: <UsersIconSVG /> },
              { value: 'Rewards', label: 'Shown as estimates', svg: <SpeedIconSVG /> },
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
                Generic lists hide the trade-offs. CardSense combines your spending inputs with fee and reward rules to produce explainable estimates.
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
                    Free personalized recommendations tailored to your Indian credit profile.
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
            <p className="text-xs text-muted-foreground">Not a financial advisor. Built for education.</p>
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
