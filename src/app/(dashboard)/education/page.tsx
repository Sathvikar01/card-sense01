import { createPublicServerClient } from '@/lib/supabase/public-server'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Clock, Eye, GraduationCap, Shield, Lightbulb, CreditCard, TrendingUp, Receipt } from 'lucide-react'
import { ArticleLink } from '@/components/education/article-link'
import { EducationRoutePrefetch } from '@/components/education/education-route-prefetch'

export const revalidate = 300

interface EducationArticle {
  id: string
  slug: string
  title: string
  summary: string
  category: string
  difficulty: string
  read_time_minutes: number
  view_count: number | null
  tags: string[] | null
}

const CATEGORY_META: Record<string, { icon: typeof BookOpen; label: string; color: string; bgColor: string }> = {
  basics: { icon: CreditCard, label: 'Basics', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  CIBIL: { icon: TrendingUp, label: 'CIBIL', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  rewards: { icon: Lightbulb, label: 'Rewards', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  fees: { icon: Receipt, label: 'Fees', color: 'text-rose-700', bgColor: 'bg-rose-50' },
  security: { icon: Shield, label: 'Security', color: 'text-violet-700', bgColor: 'bg-violet-50' },
  tips: { icon: GraduationCap, label: 'Tips', color: 'text-cyan-700', bgColor: 'bg-cyan-50' },
}

export default async function EducationPage() {
  const supabase = createPublicServerClient()

  const { data: articles } = await supabase
    .from('education_articles')
    .select('id, slug, title, summary, category, difficulty, read_time_minutes, view_count, tags')
    .eq('is_published', true)
    .order('view_count', { ascending: false }) as { data: EducationArticle[] | null }

  const categories = ['All', 'basics', 'CIBIL', 'rewards', 'fees', 'security', 'tips']
  const topSlugs = (articles || []).slice(0, 6).map((article) => article.slug)

  const getArticlesByCategory = (category: string) => {
    if (category === 'All') return articles || []
    return articles?.filter((article) => article.category === category) || []
  }

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

  const totalArticles = articles?.length || 0

  return (
    <div className="space-y-8">
      <EducationRoutePrefetch slugs={topSlugs} />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-[#d4a017]/20 bg-gradient-to-br from-[#fdf3d7]/80 via-white to-[#fdf3d7]/40 p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#d4a017]/8 blur-[80px]" />
          <div className="absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-[#e8c04a]/6 blur-[60px]" />
        </div>

        <div className="relative z-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b8860b]/70">
            Learn & Grow
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Credit Education
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Everything you need to know about credit cards, CIBIL scores, rewards optimization, and responsible usage -- from beginner to pro.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#b8860b]" />
              {totalArticles} articles
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-[#b8860b]" />
              6 categories
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#b8860b]" />
              Beginner to Advanced
            </span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 rounded-xl">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#b8860b] data-[state=active]:shadow-sm"
            >
              {cat === 'All' ? 'All' : CATEGORY_META[cat]?.label || cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getArticlesByCategory(category).map((article) => {
                const catMeta = CATEGORY_META[article.category]
                const CatIcon = catMeta?.icon || BookOpen

                return (
                  <ArticleLink key={article.id} href={`/education/${article.slug}`}>
                    <div className="group h-full rounded-2xl border border-border/60 bg-card p-5 transition-all hover:border-[#d4a017]/40 hover:shadow-lg hover:shadow-[#d4a017]/5 hover:-translate-y-0.5">
                      {/* Category icon + difficulty */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${catMeta?.bgColor || 'bg-muted'}`}>
                          <CatIcon className={`h-4 w-4 ${catMeta?.color || 'text-muted-foreground'}`} />
                        </div>
                        <Badge className={`text-[0.6rem] font-medium border ${getDifficultyStyle(article.difficulty)}`}>
                          {article.difficulty.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-foreground group-hover:text-[#b8860b] transition-colors leading-snug mb-2">
                        {article.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {article.summary}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/80 mt-auto">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.read_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.view_count || 0}
                        </span>
                        <Badge variant="outline" className="text-[0.6rem] capitalize ml-auto">
                          {article.category}
                        </Badge>
                      </div>

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/40">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[0.6rem] px-2 py-0.5 rounded-full bg-[#fdf3d7]/60 text-[#7a5500] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </ArticleLink>
                )
              })}
            </div>

            {getArticlesByCategory(category).length === 0 && (
              <div className="text-center py-16">
                <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-[#fdf3d7]">
                  <BookOpen className="h-7 w-7 text-[#b8860b]" />
                </div>
                <p className="text-sm font-medium text-foreground">No articles in this category yet</p>
                <p className="text-xs text-muted-foreground mt-1">Check back soon for new content</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
