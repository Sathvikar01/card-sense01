import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { ArticleLink } from '@/components/education/article-link'
import { ArticleViewTracker } from '@/components/education/article-view-tracker'
import { Badge } from '@/components/ui/badge'
import { EducationFAQ } from '@/components/education/education-faq'
import { BookOpen, Clock, ArrowLeft, CreditCard, TrendingUp, Lightbulb, Receipt, Shield, GraduationCap } from 'lucide-react'

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

const CATEGORY_META: Record<string, { icon: typeof BookOpen; label: string; color: string; bgColor: string }> = {
  basics: { icon: CreditCard, label: 'Basics', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  CIBIL: { icon: TrendingUp, label: 'CIBIL', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  rewards: { icon: Lightbulb, label: 'Rewards', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  fees: { icon: Receipt, label: 'Fees', color: 'text-rose-700', bgColor: 'bg-rose-50' },
  security: { icon: Shield, label: 'Security', color: 'text-violet-700', bgColor: 'bg-violet-50' },
  tips: { icon: GraduationCap, label: 'Tips', color: 'text-cyan-700', bgColor: 'bg-cyan-50' },
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

  const getDifficultyStyle = (difficulty: string) => {
    const styles: Record<string, string> = {
      beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      beginner_to_intermediate: 'bg-teal-100 text-teal-700 border-teal-200',
      intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
      intermediate_to_advanced: 'bg-orange-100 text-orange-700 border-orange-200',
      advanced: 'bg-rose-100 text-rose-700 border-rose-200',
    }
    return styles[difficulty] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const catMeta = CATEGORY_META[article.category]
  const CatIcon = catMeta?.icon || BookOpen
  const { intro, sections } = parseMarkdownSections(article.content)

  return (
    <div className="space-y-8">
      <ArticleViewTracker slug={slug} />

      {/* Back link */}
      <Link
        href="/education"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#b8860b] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Articles
      </Link>

      {/* Article Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4a017]/20 bg-gradient-to-br from-[#fdf3d7]/80 via-white to-[#fdf3d7]/40 p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#d4a017]/8 blur-[80px]" />
          <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-[#e8c04a]/6 blur-[60px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${catMeta?.bgColor || 'bg-muted'}`}>
              <CatIcon className={`h-4 w-4 ${catMeta?.color || 'text-muted-foreground'}`} />
            </div>
            <Badge variant="outline" className="capitalize text-xs">
              {catMeta?.label || article.category}
            </Badge>
            <Badge className={`text-[0.6rem] font-medium border ${getDifficultyStyle(article.difficulty)}`}>
              {article.difficulty.replace(/_/g, ' ')}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {article.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#b8860b]" />
              {article.read_time_minutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarSVG />
              {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {article.tags.map((tag: string, idx: number) => (
                <span key={idx} className="text-[0.6rem] px-2 py-0.5 rounded-full bg-[#fdf3d7]/80 text-[#7a5500] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {intro && (
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <p className="text-sm leading-relaxed text-foreground/90">{intro}</p>
            </div>
          )}

          <EducationFAQ sections={sections} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {sections.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h3 className="font-semibold mb-3 text-xs uppercase tracking-[0.15em] text-[#b8860b]/70">
                In this article
              </h3>
              <nav className="space-y-1">
                {sections.map((s, i) => (
                  <div
                    key={i}
                    className="text-sm text-foreground/70 hover:text-foreground transition-colors py-1.5 border-l-2 border-transparent hover:border-[#d4a017] pl-3 cursor-default"
                  >
                    {s.heading}
                  </div>
                ))}
              </nav>
            </div>
          )}

          <div className="rounded-2xl border border-border/60 bg-card p-5 sticky top-4">
            <h3 className="font-semibold mb-4 text-sm text-foreground">Related Articles</h3>
            {relatedArticles && relatedArticles.length > 0 ? (
              <div className="space-y-2">
                {relatedArticles.map((related) => {
                  const relCatMeta = CATEGORY_META[related.category]
                  const RelCatIcon = relCatMeta?.icon || BookOpen
                  return (
                    <ArticleLink
                      key={related.id}
                      href={`/education/${related.slug}`}
                      className="block p-3 rounded-xl hover:bg-[#fdf3d7]/40 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${relCatMeta?.bgColor || 'bg-muted'}`}>
                          <RelCatIcon className={`h-3.5 w-3.5 ${relCatMeta?.color || 'text-muted-foreground'}`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm mb-1 text-foreground group-hover:text-[#b8860b] transition-colors leading-snug">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{relCatMeta?.label || related.category}</span>
                            <span className="text-border">|</span>
                            <span>{related.read_time_minutes} min</span>
                          </div>
                        </div>
                      </div>
                    </ArticleLink>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No related articles found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#b8860b]">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
