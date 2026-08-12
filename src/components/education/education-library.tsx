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
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  beginner_to_intermediate: 'border-sky-200 bg-sky-50 text-sky-700',
  intermediate: 'border-amber-200 bg-amber-50 text-amber-700',
  intermediate_to_advanced: 'border-orange-200 bg-orange-50 text-orange-700',
  advanced: 'border-rose-200 bg-rose-50 text-rose-700',
}

const LEARNING_PATHS = [
  {
    number: '01',
    eyebrow: 'Start here',
    title: 'Understand the card',
    description: 'Credit, debit, limits, statements and the one payment habit that prevents expensive surprises.',
    icon: BookOpen,
    tone: 'bg-sky-50 text-sky-700',
    match: (article: EducationLibraryArticle) => article.title === 'What is a Credit Card?',
  },
  {
    number: '02',
    eyebrow: 'Build confidence',
    title: 'Build your score',
    description: 'Learn what CIBIL measures, how reports work and which actions help over time.',
    icon: Target,
    tone: 'bg-emerald-50 text-emerald-700',
    match: (article: EducationLibraryArticle) => article.title === 'Understanding CIBIL Score',
  },
  {
    number: '03',
    eyebrow: 'Spend smarter',
    title: 'Make the maths work',
    description: 'Compare rewards with fees, understand interest and avoid “good deal” traps.',
    icon: Lightbulb,
    tone: 'bg-amber-50 text-amber-700',
    match: (article: EducationLibraryArticle) => article.title === 'Understanding Reward Programs',
  },
  {
    number: '04',
    eyebrow: 'Go deeper',
    title: 'Use credit like a pro',
    description: 'Turn the basics into a repeatable monthly system for cards, rewards and security.',
    icon: GraduationCap,
    tone: 'bg-violet-50 text-violet-700',
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
    return articles
      .filter((article) => activeCategory === 'all' || article.category === activeCategory)
      .filter((article) => {
        if (!normalizedQuery) return true
        return [article.title, article.summary, article.category, ...(article.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((a, b) => {
        const order = { beginner: 0, beginner_to_intermediate: 1, intermediate: 2, intermediate_to_advanced: 3, advanced: 4 }
        return (order[a.difficulty as keyof typeof order] ?? 5) - (order[b.difficulty as keyof typeof order] ?? 5)
      })
  }, [activeCategory, articles, query])

  const clearSearch = () => setQuery('')

  return (
    <div className="space-y-10">
      <section className="education-hero relative overflow-hidden border border-emerald-950/20 px-6 py-8 text-white shadow-[0_24px_70px_-36px_rgba(25,74,63,0.7)] sm:px-10 sm:py-11">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-amber-200/15 bg-amber-200/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-100">
              <Sparkles className="h-3.5 w-3.5" /> Learn by doing
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.05]">
              Your credit card field guide.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/80 sm:text-base">
              Start with the words you do not know. Build the habits that keep interest at zero. Then learn the maths behind rewards and fees.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-emerald-50/80">
              <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-200" /> {articles.length} CardSense lessons</span>
              <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-amber-200" /> 4-step path</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-200" /> Trusted reading shelf</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/80">The one rule</p>
            <p className="mt-3 text-lg font-medium leading-7 text-white">A reward is never worth paying interest to earn it.</p>
            <p className="mt-2 text-xs leading-5 text-emerald-50/65">If you only remember one thing today, remember this. The rest gets easier from here.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="learning-path-heading" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8860b]">No random browsing</p>
            <h2 id="learning-path-heading" className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Follow the path from first swipe to confident user</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">Each step answers the question you need before the next one. Skip ahead whenever you are ready.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {LEARNING_PATHS.map((path) => {
            const PathIcon = path.icon
            const lesson = articles.find(path.match)
            return (
              <div key={path.number} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[#d4a017]/50 hover:shadow-lg hover:shadow-amber-900/5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${path.tone}`}><PathIcon className="h-5 w-5" /></div>
                  <span className="font-mono text-xs text-muted-foreground/50">{path.number}</span>
                </div>
                <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{path.eyebrow}</p>
                <h3 className="mt-1.5 text-lg font-semibold text-foreground">{path.title}</h3>
                <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">{path.description}</p>
                {lesson ? (
                  <Link href={`/education/${lesson.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#9a7100] transition-colors hover:text-[#6f5100]">
                    Read the lesson <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">Coming in the library</span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[#d4a017]/25 bg-[#fffaf0] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3dfaa] text-[#8c6500]"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold text-foreground">If you are brand new, start with these three rules</h2>
              <p className="mt-1 text-sm text-muted-foreground">They will keep you safe while you learn the rest.</p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-foreground sm:grid-cols-3 lg:max-w-3xl">
            <span className="rounded-xl bg-white/70 px-3 py-2.5"><strong>1.</strong> Pay the full statement balance.</span>
            <span className="rounded-xl bg-white/70 px-3 py-2.5"><strong>2.</strong> Never share your OTP or CVV.</span>
            <span className="rounded-xl bg-white/70 px-3 py-2.5"><strong>3.</strong> Check fees before chasing rewards.</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="lesson-library-heading" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8860b]">CardSense lessons</p>
            <h2 id="lesson-library-heading" className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Find the answer, not just another article</h2>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Search education lessons"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search “interest”, “CIBIL”, “rewards”…"
              className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-[#b8860b] focus:ring-2 focus:ring-[#d4a017]/15"
            />
            {query && <button type="button" aria-label="Clear search" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Education topics">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${activeCategory === category.value ? 'border-[#b8860b] bg-[#b8860b] text-white' : 'border-border bg-card text-muted-foreground hover:border-[#d4a017]/60 hover:text-foreground'}`}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="mr-1 self-center text-xs font-semibold text-muted-foreground">Try a question:</span>
          {QUESTION_PROMPTS.map((prompt) => (
            <button key={prompt.label} type="button" onClick={() => { setQuery(prompt.query); setActiveCategory('all') }} className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-[#b8860b]/60 hover:text-foreground">{prompt.label}</button>
          ))}
        </div>
        <div className="flex items-center justify-between border-b border-border pb-3 text-xs text-muted-foreground">
          <span>{filteredArticles.length} {filteredArticles.length === 1 ? 'lesson' : 'lessons'} {query ? `matching “${query}”` : 'to explore'}</span>
          {query && <button type="button" onClick={clearSearch} className="font-semibold text-[#9a7100] hover:text-[#6f5100]">Show all lessons</button>}
        </div>
        {filteredArticles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link key={article.id} href={`/education/${article.slug}`} className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[#d4a017]/50 hover:shadow-lg hover:shadow-amber-900/5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">{CATEGORY_LABELS[article.category] || article.category}</span>
                  <Badge className={`border text-[0.62rem] font-semibold ${DIFFICULTY_STYLES[article.difficulty] || 'border-border bg-muted text-muted-foreground'}`}>{DIFFICULTY_LABELS[article.difficulty] || 'Lesson'}</Badge>
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug text-foreground group-hover:text-[#9a7100]">{article.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{article.summary}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {article.read_time_minutes} min read</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#9a7100]">Open lesson <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <Search className="mx-auto h-7 w-7 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold text-foreground">No lesson matches that search yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a simpler word like “fee”, “score” or “payment”.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="trusted-reading-heading" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b8860b]">Beyond CardSense</p>
            <h2 id="trusted-reading-heading" className="mt-1 text-2xl font-semibold tracking-tight text-foreground">A shelf of useful outside reading</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Official guidance first. Explainers second. Open a guide when you want another angle, not because you need to read everything.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(showAllResources ? EDUCATION_RESOURCES : EDUCATION_RESOURCES.slice(0, 6)).map((resource) => (
            <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[#d4a017]/50 hover:shadow-lg hover:shadow-amber-900/5">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${resource.sourceType === 'Official' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                {resource.sourceType === 'Official' ? <ShieldCheck className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[0.63rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>{resource.source}</span><span className="text-border">•</span><span>{resource.topic}</span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold leading-snug text-foreground group-hover:text-[#9a7100]">{resource.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{resource.summary}</p>
                <div className="mt-3 flex items-center gap-3 text-[0.68rem] text-muted-foreground"><span>{resource.level}</span><span>•</span><span>{resource.minutes} min</span><ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-[#b8860b]" /></div>
              </div>
            </a>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 pt-1 text-center">
          <button type="button" onClick={() => setShowAllResources((current) => !current)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-[#b8860b] hover:text-[#9a7100]">
            {showAllResources ? 'Show a shorter shelf' : `Show ${EDUCATION_RESOURCES.length - 6} more trusted reads`}<ArrowRight className={`h-3.5 w-3.5 transition-transform ${showAllResources ? '-rotate-90' : 'rotate-90'}`} />
          </button>
          <p className="max-w-2xl text-[0.68rem] leading-5 text-muted-foreground">External pages can change their fees, offers or advice. Always confirm current terms with your card issuer and the latest RBI/CIBIL guidance.</p>
        </div>
      </section>
    </div>
  )
}
