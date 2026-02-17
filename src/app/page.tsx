'use client'

import Link from 'next/link'
import { ArrowRight, CreditCard, Sparkles, ShieldCheck, TrendingUp, Zap, Star, Check, Users, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { ParticleField } from '@/components/shared/particle-field'

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
    gradient: 'from-violet-500/10 to-purple-500/10',
    iconColor: 'text-violet-600',
    iconBg: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Real Reward Math',
    description: 'See annual value, fee impact, and category-wise reward breakdown before you apply. No guesswork.',
    icon: TrendingUp,
    gradient: 'from-emerald-500/10 to-green-500/10',
    iconColor: 'text-emerald-600',
    iconBg: 'from-emerald-500 to-green-600',
  },
  {
    title: 'Smart Eligibility',
    description: 'Avoid rejections. Get cards you can realistically get approved for based on your CIBIL score and profile.',
    icon: ShieldCheck,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-600',
    iconBg: 'from-blue-500 to-cyan-600',
  },
]

const carouselCards = [
  { id: 'hdfc-regalia-gold' },
  { id: 'icici-amazon-pay' },
  { id: 'hdfc-diners-club-black' },
  { id: 'sbi-cashback' },
  { id: 'axis-flipkart' },
  { id: 'hdfc-infinia' },
  { id: 'icici-sapphiro' },
  { id: 'sbi-elite' },
]

const stats = [
  { value: '50+', label: 'Indian Cards', icon: CreditCard },
  { value: '10K+', label: 'Users Helped', icon: Users },
  { value: '2 min', label: 'To Recommendations', icon: Zap },
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
  const totalCards = carouselCards.length
  const radius = 340

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/25"
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <CreditCard className="h-5 w-5" />
            </motion.div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              CARD<span className="text-gradient-primary">SENSE</span>
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
        <section className="relative px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="ambient-orb left-[10%] top-[10%] h-[400px] w-[400px] bg-violet-400/20" />
            <div className="ambient-orb right-[10%] top-[20%] h-[350px] w-[350px] bg-purple-400/15" style={{ animationDelay: '-7s' }} />
            <div className="ambient-orb bottom-[10%] left-[30%] h-[300px] w-[300px] bg-blue-400/10" style={{ animationDelay: '-14s' }} />
          </div>

          <div className="relative mx-auto max-w-7xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/80 px-4 py-1.5 backdrop-blur-sm"
            >
              <Zap className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700 tracking-wide">AI-Powered Credit Card Intelligence</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="cardsense-hero-title mx-auto mt-6 max-w-3xl text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl"
            >
              Find your{' '}
              <span className="text-gradient-primary">perfect card</span>
              {' '}in seconds
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              Professional AI advisor that analyzes your profile, spending habits, and goals to recommend the best Indian credit cards with real reward calculations.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
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
                  Browse Catalog
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6"
            >
              {[
                'Free forever',
                'No credit check',
                'Instant results',
              ].map((text) => (
                <div key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ====== 3D Rotating Card Carousel ====== */}
        <section className="relative py-16 lg:py-24">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <ParticleField className="opacity-30" particleCount={30} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="card-carousel relative mx-auto h-[280px] w-full max-w-4xl sm:h-[320px] lg:h-[380px]"
          >
            <div
              className="card-carousel-track absolute left-1/2 top-1/2"
              style={{
                width: 0,
                height: 0,
                transformStyle: 'preserve-3d',
              }}
            >
              {carouselCards.map((card, idx) => {
                const angle = (360 / totalCards) * idx
                return (
                  <div
                    key={card.id}
                    className="absolute"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                      left: '-100px',
                      top: '-80px',
                    }}
                  >
                    <CreditCardVisual
                      cardId={card.id}
                      size="sm"
                    />
                  </div>
                )
              })}
            </div>

            {/* Center glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[80px]" />
          </motion.div>

          {/* Floating badge below carousel */}
          <motion.div
            className="relative z-10 mx-auto -mt-4 w-fit rounded-2xl border border-white/40 bg-white/70 px-6 py-3 shadow-xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Rs 18,200</p>
                <p className="text-xs text-muted-foreground">Avg. yearly value saved</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ====== Stats Row ====== */}
        <section className="relative px-4 py-12 sm:px-6 lg:px-8">
          <div className="section-divider mx-auto mb-12 max-w-xl" />
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 text-violet-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ====== Feature Cards ====== */}
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
              <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
                Powered by advanced AI. Designed for real Indian spending patterns.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {valuePoints.map((point, idx) => {
                const Icon = point.icon
                return (
                  <motion.article
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
                  </motion.article>
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
                    <div className="hidden md:block absolute -right-4 top-1/2 z-10 -translate-y-1/2">
                      <ArrowRight className="h-5 w-5 text-violet-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== CTA Section ====== */}
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
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">
                    Ready to start
                  </p>
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
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 text-white">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">CardSense India</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/cards" className="hover:text-foreground transition-colors">Card Catalog</Link>
              <Link href="/education" className="hover:text-foreground transition-colors">Education</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with AI. Not a financial advisor.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
