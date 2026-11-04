'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
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
        className="mb-4 bg-card"
      />

      <ToggleGroup
        type="single"
        variant="plain"
        aria-label="Topic"
        value={category}
        onValueChange={(value) => setCategory(value || 'all')}
        className="-mx-4 mb-6 flex-nowrap overflow-x-auto px-4 [scrollbar-width:none]"
      >
        {CATEGORIES.map((c) => (
          <ToggleGroupItem key={c.value} value={c.value} className="shrink-0">
            {c.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {filtered.length > 0 ? (
        <ul>
          {filtered.map((article) => (
            <li key={article.id}>
              <Link href={`/education/${article.slug}`} className="row items-baseline">
                <span className="min-w-0 flex-1 text-base">{article.title}</span>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{article.read_time_minutes} min</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3 py-6">
          <p className="text-muted-foreground">
            {query ? `No lessons match “${query.trim()}”.` : 'No lessons in this topic yet.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery('')
              setCategory('all')
            }}
          >
            Show all lessons
          </Button>
        </div>
      )}

      <Section title="Further reading" className="mt-12">
        <ul>
          {EDUCATION_RESOURCES.map((resource) => (
            <li key={resource.url}>
              <a href={resource.url} target="_blank" rel="noreferrer" className="row">
                <span className="min-w-0 flex-1 text-base">{resource.title}</span>
                <span className="shrink-0 text-sm text-muted-foreground">{resource.source}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
