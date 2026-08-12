import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { ArticleLink } from '@/components/education/article-link'
import { ArticleViewTracker } from '@/components/education/article-view-tracker'
import { EducationFAQ } from '@/components/education/education-faq'
import { ArrowLeft, BookOpen, CalendarDays, Clock, CreditCard, GraduationCap, Lightbulb, Receipt, Shield, TrendingUp } from 'lucide-react'

export const revalidate = 300

interface ArticleRecord {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  difficulty: string
  read_time_minutes: number
  created_at: string
  tags: string[] | null
  content: string
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  category: string
  read_time_minutes: number
}

interface Section {
  heading: string
  body: string
}

const CATEGORY_META: Record<string, { icon: typeof BookOpen; label: string }> = {
  basics: { icon: CreditCard, label: 'Credit basics' },
  CIBIL: { icon: TrendingUp, label: 'CIBIL score' },
  rewards: { icon: Lightbulb, label: 'Rewards' },
  fees: { icon: Receipt, label: 'Fees' },
  security: { icon: Shield, label: 'Safety' },
  tips: { icon: GraduationCap, label: 'Smart habits' },
}

function parseMarkdownSections(content: string): { intro: string; sections: Section[] } {
  const lines = content.split('\n')
  let intro = ''
  const sections: Section[] = []
  let currentHeading = ''
  let currentBody: string[] = []

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)

    if (h2Match) {
      if (currentHeading) sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() })
      currentHeading = h2Match[1]
      currentBody = []
    } else if (!currentHeading) {
      intro += line + '\n'
    } else {
      currentBody.push(line)
    }
  }

  if (currentHeading) sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() })
  return { intro: intro.trim(), sections }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createPublicServerClient()

  const { data: article } = await supabase
    .from('education_articles')
    .select('id, slug, title, summary, category, difficulty, read_time_minutes, created_at, tags, content')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: ArticleRecord | null }

  if (!article) notFound()

  const { data: relatedArticles } = await supabase
    .from('education_articles')
    .select('id, title, slug, category, read_time_minutes')
    .eq('category', article.category)
    .eq('is_published', true)
    .neq('id', article.id)
    .limit(3) as { data: RelatedArticle[] | null }

  const catMeta = CATEGORY_META[article.category]
  const CatIcon = catMeta?.icon || BookOpen
  const { intro, sections } = parseMarkdownSections(article.content)

  return (
    <article className="education-article space-y-10 sm:space-y-14">
      <ArticleViewTracker slug={slug} />

      <Link href="/education" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[#8d6500]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to education
      </Link>

      <header className="border-y border-[#d4a017]/35 py-8 sm:py-11">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#a87500]">
            <span className="inline-flex items-center gap-2"><CatIcon className="h-4 w-4" strokeWidth={1.7} /> {catMeta?.label || article.category}</span>
            <span className="text-border" aria-hidden="true">·</span>
            <span>{article.difficulty.replace(/_/g, ' ')}</span>
          </div>
          <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-foreground sm:text-5xl">{article.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{article.summary}</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[#b8860b]" /> {article.read_time_minutes} min read</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-[#b8860b]" /> {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {article.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
        <main className="min-w-0">
          {intro && (
            <div className="mb-8 border-l-2 border-[#d4a017] pl-5 sm:pl-6">
              <p className="text-base leading-8 text-foreground/90 sm:text-lg">{intro}</p>
            </div>
          )}
          <EducationFAQ sections={sections} />
        </main>

        <aside className="space-y-10 lg:sticky lg:top-6 lg:self-start">
          {sections.length > 0 && (
            <nav aria-label="In this article">
              <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#a87500]">In this article</p>
              <ol className="space-y-3 border-l border-border pl-4">
                {sections.map((section, i) => <li key={section.heading}><a href={`#section-${i + 1}`} className="text-sm leading-5 text-muted-foreground transition-colors hover:text-[#8d6500]">{section.heading}</a></li>)}
              </ol>
            </nav>
          )}

          <div>
            <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#a87500]">Read next</p>
            {relatedArticles && relatedArticles.length > 0 ? (
              <div className="border-t border-border">
                {relatedArticles.map((related) => (
                  <ArticleLink key={related.id} href={`/education/${related.slug}`} className="group block border-b border-border py-4">
                    <h2 className="text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-[#8d6500]">{related.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{related.read_time_minutes} min · {CATEGORY_META[related.category]?.label || related.category}</p>
                  </ArticleLink>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No related articles yet.</p>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}
