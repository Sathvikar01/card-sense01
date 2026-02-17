'use client'

import Link from 'next/link'
import { ArrowRight, CreditCard, Sparkles, ShieldCheck, TrendingUp, Zap, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { CreditCardVisual } from '@/components/cards/credit-card-visual'
import { ParticleField } from '@/components/shared/particle-field'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Catalog', href: '/cards' },
  { label: 'Log In', href: '/login' },
]

const valuePoints = [
  {
    title: 'AI-Powered Matching',
    description: 'Our Gemini-powered engine analyzes your spending patterns, income, and goals to find your perfect card match.',
    icon: Sparkles,
    gradient: 'from-violet-500/10 to-purple-500/10',
    iconColor: 'text-violet-600',
  },
  {
    title: 'Real Reward Math',
    description: 'See annual value, fee impact, and category-wise reward breakdown before you apply. No guesswork.',
    icon: TrendingUp,
    gradient: 'from-emerald-500/10 to-green-500/10',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Smart Eligibility',
    description: 'Avoid rejections. Get cards you can realistically get approved for based on your CIBIL score and profile.',
    icon: ShieldCheck,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconColor: 'text-blue-600',
  },
]

const showcaseCards = [
  { id: 'hdfc-regalia-gold', rotate: -12, x: -60, y: 20, delay: 0 },
  { id: 'icici-amazon-pay', rotate: 5, x: 40, y: -30, delay: 0.1 },
  { id: 'hdfc-diners-club-black', rotate: -3, x: -20, y: 60, delay: 0.2 },
]

const stats = [
  { value: '50+', label: 'Indian Cards' },
  { value: 'AI', label: 'Powered Analysis' },
  { value: '2 min', label: 'To Recommendations' },
]

export default function HomePage() {
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

      {/* Hero Section */}
      <main>
        <section className="relative px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="ambient-orb left-[10%] top-[10%] h-[400px] w-[400px] bg-violet-400/20" />
            <div className="ambient-orb right-[10%] top-[20%] h-[350px] w-[350px] bg-purple-400/15" style={{ animationDelay: '-7s' }} />
            <div className="ambient-orb bottom-[10%] left-[30%] h-[300px] w-[300px] bg-blue-400/10" style={{ animationDelay: '-14s' }} />
          </div>

          <div className="relative mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left: Text content */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/80 px-4 py-1.5 backdrop-blur-sm"
              >
                <Zap className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-semibold text-violet-700 tracking-wide">AI-Powered Credit Card Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="cardsense-hero-title max-w-xl text-5xl leading-[1.05] text-foreground lg:text-[3.5rem]"
              >
                Find your{' '}
                <span className="text-gradient-primary">perfect card</span>
                {' '}in seconds
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="max-w-lg text-lg leading-relaxed text-muted-foreground"
              >
                Professional AI advisor that analyzes your profile, spending habits, and goals to recommend the best Indian credit cards with real reward calculations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
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

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="flex items-center gap-8 pt-4"
              >
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Floating card showcase */}
            <div className="relative hidden min-h-[500px] lg:block">
              <ParticleField className="opacity-60" particleCount={25} />

              {showcaseCards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  className="absolute"
                  initial={{ opacity: 0, y: 60, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: card.rotate,
                    x: card.x,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 20,
                    delay: 0.4 + card.delay,
                  }}
                  style={{
                    top: `${15 + idx * 28}%`,
                    left: `${10 + idx * 20}%`,
                    zIndex: 3 - idx,
                  }}
                >
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 4 + idx,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 0.5,
                    }}
                  >
                    <CreditCardVisual
                      cardId={card.id}
                      size="md"
                      interactive
                    />
                  </motion.div>
                </motion.div>
              ))}

              {/* Floating badge */}
              <motion.div
                className="absolute bottom-[15%] right-[5%] z-10 rounded-2xl border border-white/40 bg-white/70 px-5 py-3 shadow-xl backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 20 }}
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
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section id="features" className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12 text-center"
            >
              <h2 className="cardsense-hero-title text-3xl text-foreground lg:text-4xl">
                Why CardSense?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
                Built for the Indian credit card ecosystem. Powered by advanced AI.
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
                      <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${point.gradient}`}>
                        <Icon className={`h-6 w-6 ${point.iconColor}`} />
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

        {/* CTA Section */}
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
      </main>
    </div>
  )
}
