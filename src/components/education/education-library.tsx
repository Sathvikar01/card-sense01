'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/page-header'
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

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search lessons"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="pl-9"
        />
      </div>

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
              category === c.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <ul className="surface divide-y divide-border">
          {filtered.map((article) => (
            <li key={article.id}>
              <Link
                href={`/education/${article.slug}`}
                className="flex items-baseline gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0 flex-1 text-[15px]">{article.title}</span>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{article.read_time_minutes} min</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">No lessons match</p>
      )}

      <section className="mt-12">
        <h2 className="mb-3 text-base font-semibold">Further reading</h2>
        <ul className="surface divide-y divide-border">
          {EDUCATION_RESOURCES.map((resource) => (
            <li key={resource.url}>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px]">{resource.title}</span>
                  <span className="block text-sm text-muted-foreground">{resource.source}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
