import { notFound } from 'next/navigation'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { ArticleLink } from '@/components/education/article-link'
import { ArticleViewTracker } from '@/components/education/article-view-tracker'
import ReactMarkdown from 'react-markdown'
import { BackLink } from '@/components/shared/back-link'
import { Section } from '@/components/shared/section'

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

  return (
    <article>
      <ArticleViewTracker slug={slug} />

      <BackLink href="/education">All lessons</BackLink>

      <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{article.read_time_minutes} min read</p>

      <div className="markdown mt-10 text-[17px] text-foreground">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>

      {relatedArticles && relatedArticles.length > 0 && (
        <Section title="Read next" className="mt-16">
          <ul>
            {relatedArticles.map((related) => (
              <li key={related.id}>
                <ArticleLink href={`/education/${related.slug}`} className="row items-baseline">
                  <span className="min-w-0 flex-1 text-base">{related.title}</span>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{related.read_time_minutes} min</span>
                </ArticleLink>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  )
}
