'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
import { Section } from '@/components/shared/section'
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

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'basics', label: 'Basics' },
  { value: 'CIBIL', label: 'CIBIL' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'fees', label: 'Fees' },
  { value: 'security', label: 'Safety' },
  { value: 'tips', label: 'Habits' },
]

const DIFFICULTY_ORDER: Record<string, number> = {
  beginner: 0,
  beginner_to_intermediate: 1,
  intermediate: 2,
  intermediate_to_advanced: 3,
  advanced: 4,
}

export function EducationLibrary({ articles }: { articles: EducationLibraryArticle[] }) {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles
      .filter((a) => category === 'all' || a.category === category)
      .filter((a) => !q || [a.title, a.summary, a.category, ...(a.tags || [])].join(' ').toLowerCase().includes(q))
      .sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 5) - (DIFFICULTY_ORDER[b.difficulty] ?? 5))
  }, [articles, category, query])

  return (
    <div>
      <PageHeader title="Learn" />

      <Input
        type="search"
        aria-label="Search lessons"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search lessons"
        className="mb-4 bg-white"
      />

      <div role="tablist" aria-label="Topics" className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={category === c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
              category === c.value ? 'bg-gold font-medium text-pine' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <ul>
          {filtered.map((article) => (
            <li key={article.id}>
              <Link href={`/education/${article.slug}`} className="row items-baseline">
                <span className="min-w-0 flex-1 text-[15px]">{article.title}</span>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{article.read_time_minutes} min</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">No lessons match</p>
      )}

      <Section title="Further reading" className="mt-12">
        <ul>
          {EDUCATION_RESOURCES.map((resource) => (
            <li key={resource.url}>
              <a href={resource.url} target="_blank" rel="noreferrer" className="row">
                <span className="min-w-0 flex-1 text-[15px]">{resource.title}</span>
                <span className="shrink-0 text-sm text-muted-foreground">{resource.source}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
