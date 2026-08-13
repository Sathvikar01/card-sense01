'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Search,
  ShieldCheck,
  Target,
  X,
} from 'lucide-react'
import { EDUCATION_RESOURCES } from './education-resources'

export interface EducationLibraryArticle {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  difficulty: string
  read_time_minutes: number
  tags: string[] | null
}

interface EducationLibraryProps {
  articles: EducationLibraryArticle[]
}

const CATEGORIES = [
  { value: 'all', label: 'All lessons' },
  { value: 'basics', label: 'Credit basics' },
  { value: 'CIBIL', label: 'CIBIL score' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'fees', label: 'Fees' },
  { value: 'security', label: 'Safety' },
  { value: 'tips', label: 'Smart habits' },
]

const CATEGORY_LABELS: Record<string, string> = {
  basics: 'Credit basics',
  CIBIL: 'CIBIL score',
  rewards: 'Rewards',
  fees: 'Fees',
  security: 'Safety',
  tips: 'Smart habits',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Start here',
  beginner_to_intermediate: 'Build confidence',
  intermediate: 'Build confidence',
  intermediate_to_advanced: 'Go deeper',
  advanced: 'Go deeper',
}

const LEARNING_PATHS = [
  {
    number: '01',
    eyebrow: 'Start here',
    title: 'Understand the card',
    description: 'Credit, debit, limits, statements and the payment habit that prevents expensive surprises.',
    icon: BookOpen,
    match: (article: EducationLibraryArticle) => article.title === 'What is a Credit Card?',
  },
  {
    number: '02',
    eyebrow: 'Build confidence',
    title: 'Build your score',
    description: 'Learn what CIBIL measures, how reports work and which actions help over time.',
    icon: Target,
    match: (article: EducationLibraryArticle) => article.title === 'Understanding CIBIL Score',
  },
  {
    number: '03',
    eyebrow: 'Spend smarter',
    title: 'Make the maths work',
    description: 'Compare rewards with fees, understand interest and avoid “good deal” traps.',
    icon: Lightbulb,
    match: (article: EducationLibraryArticle) => article.title === 'Understanding Reward Programs',
  },
  {
    number: '04',
    eyebrow: 'Go deeper',
    title: 'Use credit with intention',
    description: 'Turn the basics into a repeatable monthly system for cards, rewards and security.',
    icon: GraduationCap,
    match: (article: EducationLibraryArticle) => article.title === 'Beginner to Pro: Credit Card Usage Playbook',
  },
]

const QUESTION_PROMPTS = [
  { label: 'I have never had a card', query: 'What is a Credit Card' },
  { label: 'I want a better CIBIL score', query: 'CIBIL' },
  { label: 'I want to avoid fees', query: 'fee' },
  { label: 'I want useful rewards', query: 'reward' },
]

export function EducationLibrary({ articles }: EducationLibraryProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [showAllResources, setShowAllResources] = useState(false)

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const order = {
      beginner: 0,
      beginner_to_intermediate: 1,
      intermediate: 2,
      intermediate_to_advanced: 3,
      advanced: 4,
    }

    return articles
      .filter((article) => activeCategory === 'all' || article.category === activeCategory)
      .filter((article) => {
        if (!normalizedQuery) return true
        return [article.title, article.summary, article.category, ...(article.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((a, b) => (order[a.difficulty as keyof typeof order] ?? 5) - (order[b.difficulty as keyof typeof order] ?? 5))
  }, [activeCategory, articles, query])

  return (
    <div className="education-library space-y-14 sm:space-y-20">
      <section className="education-hero !border !border-[#d4a017]/25 !bg-[linear-gradient(135deg,#30313a_0%,#292b34_58%,#23252d_100%)] !rounded-xl px-5 py-8 text-white before:hidden sm:px-10 sm:py-12">
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="mb-5 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#d4a017]">
              <span className="h-px w-7 bg-[#b8860b]" /> CardSense education
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl sm:leading-[1.05]">
              Learn the card before the card teaches you.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Short, practical lessons on credit, CIBIL, rewards and fees. Start with what is useful today and build from there.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/65">
              <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#d4a017]" /> {articles.length} lessons</span>
              <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-[#d4a017]" /> 4-step path</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#d4a017]" /> Official reading included</span>
            </div>
          </div>
          <blockquote className="border-l border-[#b8860b]/70 pl-5 lg:mb-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d4a017]/75">Keep this close</p>
            <p className="mt-3 text-xl font-medium leading-8 text-white">A reward is never worth paying interest to earn it.</p>
          </blockquote>
        </div>
      </section>

      <section aria-labelledby="learning-path-heading">
        <div className="mb-7 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a87500]">A useful order</p>
          <h2 id="learning-path-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
            Follow the path, or choose your own door in.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Each step covers the question that tends to come next. Nothing is locked.</p>
        </div>
        <ol className="grid gap-x-8 md:grid-cols-2 xl:grid-cols-4">
          {LEARNING_PATHS.map((path) => {
            const PathIcon = path.icon
            const lesson = articles.find(path.match)
            return (
              <li key={path.number} className="border-t border-[#d4a017]/35 py-5 sm:py-6">
                <div className="flex items-center justify-between text-[#a87500]">
                  <PathIcon className="h-5 w-5" strokeWidth={1.7} />
                  <span className="font-mono text-xs tracking-[0.16em] text-muted-foreground/60">{path.number}</span>
                </div>
                <p className="mt-7 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{path.eyebrow}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{path.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{path.description}</p>
                {lesson ? (
                  <Link href={`/education/${lesson.slug}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#966d00] transition-colors hover:text-[#6f5100]">
                    Read the lesson <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="mt-5 inline-flex text-xs text-muted-foreground">Coming in the library</span>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <aside className="border-y border-[#d4a017]/35 py-6 sm:py-7">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#b8860b]" strokeWidth={1.7} />
            <div>
              <h2 className="font-semibold text-foreground">Three rules while you learn</h2>
              <p className="mt-1 text-sm text-muted-foreground">Keep these boring rules close. They do a lot of work.</p>
            </div>
          </div>
          <ol className="grid gap-3 text-sm text-foreground sm:grid-cols-3">
            <li><span className="mr-2 font-mono text-xs text-[#a87500]">01</span>Pay the full statement balance.</li>
            <li><span className="mr-2 font-mono text-xs text-[#a87500]">02</span>Never share your OTP or CVV.</li>
            <li><span className="mr-2 font-mono text-xs text-[#a87500]">03</span>Check fees before chasing rewards.</li>
          </ol>
        </div>
      </aside>

      <section aria-labelledby="lesson-library-heading">
        <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a87500]">The lesson shelf</p>
            <h2 id="lesson-library-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">Find the answer, not another feed.</h2>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a87500]" />
            <input
              aria-label="Search education lessons"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search interest, CIBIL, rewards…"
              className="h-11 w-full border-b border-border bg-transparent pl-7 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-[#b8860b]"
            />
            {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>

        <div className="mt-5 flex gap-5 overflow-x-auto pb-1" role="tablist" aria-label="Education topics">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`whitespace-nowrap border-b-2 pb-2 text-xs font-semibold transition-colors ${activeCategory === category.value ? 'border-[#b8860b] text-[#8d6500]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Start with a question:</span>
          {QUESTION_PROMPTS.map((prompt) => (
            <button key={prompt.label} type="button" onClick={() => { setQuery(prompt.query); setActiveCategory('all') }} className="text-left underline decoration-[#d4a017]/50 underline-offset-4 transition-colors hover:text-[#8d6500]">
              {prompt.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredArticles.length} {filteredArticles.length === 1 ? 'lesson' : 'lessons'} {query ? `matching “${query}”` : 'to explore'}</span>
          {query && <button type="button" onClick={() => setQuery('')} className="font-semibold text-[#966d00] hover:text-[#6f5100]">Show all lessons</button>}
        </div>

        {filteredArticles.length > 0 ? (
          <div className="mt-2 grid md:grid-cols-2 md:gap-x-10">
            {filteredArticles.map((article) => (
              <Link key={article.id} href={`/education/${article.slug}`} className="group flex min-h-[9.5rem] flex-col border-t border-border py-5 transition-colors hover:border-[#d4a017]">
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{CATEGORY_LABELS[article.category] || article.category}</span>
                  <span className="text-[#966d00]">{DIFFICULTY_LABELS[article.difficulty] || 'Lesson'}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-snug text-foreground group-hover:text-[#8d6500]">{article.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{article.summary}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5 text-[#b8860b]" /> {article.read_time_minutes} min read <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#b8860b] transition-transform group-hover:translate-x-1" /></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border-t border-border py-12 text-center">
            <Search className="mx-auto h-7 w-7 text-[#b8860b]/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">No lesson matches that search yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a simpler word like “fee”, “score” or “payment”.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="trusted-reading-heading">
        <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a87500]">Beyond CardSense</p>
            <h2 id="trusted-reading-heading" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">A short shelf of useful outside reading.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Official guidance first. Open a guide when you want another angle, not because you need to read everything.</p>
        </div>
        <div className="mt-2 grid md:grid-cols-2 md:gap-x-10">
          {(showAllResources ? EDUCATION_RESOURCES : EDUCATION_RESOURCES.slice(0, 6)).map((resource) => (
            <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="group flex gap-4 border-t border-border py-5 transition-colors hover:border-[#d4a017]">
              <div className="mt-0.5 shrink-0 text-[#b8860b]">{resource.sourceType === 'Official' ? <ShieldCheck className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[0.63rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground"><span>{resource.source}</span><span aria-hidden="true">·</span><span>{resource.topic}</span></div>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground group-hover:text-[#8d6500]">{resource.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{resource.summary}</p>
                <div className="mt-3 flex items-center gap-3 text-[0.68rem] text-muted-foreground"><span>{resource.level}</span><span aria-hidden="true">·</span><span>{resource.minutes} min</span><ExternalLink className="ml-auto h-3.5 w-3.5 text-[#b8860b]" /></div>
              </div>
            </a>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 pt-6 text-center">
          <button type="button" onClick={() => setShowAllResources((current) => !current)} className="inline-flex items-center gap-2 text-xs font-semibold text-[#966d00] underline decoration-[#d4a017]/50 underline-offset-4 hover:text-[#6f5100]">
            {showAllResources ? 'Show a shorter shelf' : `Show ${Math.max(0, EDUCATION_RESOURCES.length - 6)} more trusted reads`}<ArrowRight className={`h-3.5 w-3.5 transition-transform ${showAllResources ? '-rotate-90' : 'rotate-90'}`} />
          </button>
          <p className="max-w-2xl text-[0.68rem] leading-5 text-muted-foreground">External pages can change their fees, offers or advice. Confirm current terms with your card issuer and the latest RBI/CIBIL guidance.</p>
        </div>
      </section>
    </div>
  )
}
