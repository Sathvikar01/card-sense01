import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { ArticleLink } from '@/components/education/article-link'
import { ArticleViewTracker } from '@/components/education/article-view-tracker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EducationFAQ } from '@/components/education/education-faq'

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

function parseMarkdownSections(content: string): { intro: string; sections: Section[] } {
  const lines = content.split('\n')
  let intro = ''
  const sections: Section[] = []
  let currentHeading = ''
  let currentBody: string[] = []

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)

    if (h2Match) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() })
      }
      currentHeading = h2Match[1]
      currentBody = []
    } else if (!currentHeading) {
      intro += line + '\n'
    } else {
      currentBody.push(line)
    }
  }

  if (currentHeading) {
    sections.push({ heading: currentHeading, body: currentBody.join('\n').trim() })
  }

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

  if (!article) {
    notFound()
  }

  const { data: relatedArticles } = await supabase
    .from('education_articles')
    .select('id, title, slug, category, read_time_minutes')
    .eq('category', article.category)
    .eq('is_published', true)
    .neq('id', article.id)
    .limit(3) as { data: RelatedArticle[] | null }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const { intro, sections } = parseMarkdownSections(article.content)

  return (
    <div className="space-y-6">
      <ArticleViewTracker slug={slug} />

      <div className="flex items-center gap-2">
        <Link href="/education">
          <Button variant="ghost" size="sm" className="gap-2">
            <BackArrowSVG />
            Back to Articles
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">{article.category}</Badge>
          <Badge className={getDifficultyColor(article.difficulty)}>
            {article.difficulty}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <ClockSVG /> {article.read_time_minutes} min read
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarSVG /> {new Date(article.created_at).toLocaleDateString('en-IN')}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{article.title}</h1>
        <p className="text-lg text-muted-foreground">{article.summary}</p>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {intro && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-base leading-relaxed text-foreground/90">{intro}</p>
              </CardContent>
            </Card>
          )}

          <EducationFAQ sections={sections} />
        </div>

        <div className="lg:col-span-1">
          {sections.length > 0 && (
            <Card className="mb-4">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                  In this article
                </h3>
                <nav className="space-y-1.5">
                  {sections.map((s, i) => (
                    <div key={i} className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1 border-l-2 border-transparent hover:border-violet-500 pl-3 cursor-default">
                      {s.heading}
                    </div>
                  ))}
                </nav>
              </CardContent>
            </Card>
          )}

          <Card className="sticky top-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Related Articles</h3>
              {relatedArticles && relatedArticles.length > 0 ? (
                <div className="space-y-3">
                  {relatedArticles.map((related) => (
                    <ArticleLink
                      key={related.id}
                      href={`/education/${related.slug}`}
                      className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1">{related.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs capitalize">
                          {related.category}
                        </Badge>
                        <span>{related.read_time_minutes} min</span>
                      </div>
                    </ArticleLink>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No related articles found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function BackArrowSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClockSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
