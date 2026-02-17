import { createPublicServerClient } from '@/lib/supabase/public-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Clock, TrendingUp } from 'lucide-react'
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

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      beginner_to_intermediate: 'bg-emerald-100 text-emerald-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      intermediate_to_advanced: 'bg-orange-100 text-orange-800',
      advanced: 'bg-red-100 text-red-800'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <EducationRoutePrefetch slugs={topSlugs} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credit Education</h1>
        <p className="text-gray-600 mt-1">
          Learn about credit cards, CIBIL scores, and responsible usage
        </p>
      </div>

      <Tabs defaultValue="All" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getArticlesByCategory(category).map((article) => (
                <ArticleLink key={article.id} href={`/education/${article.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{article.category}</Badge>
                        <Badge className={getDifficultyColor(article.difficulty)}>
                          {article.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {article.read_time_minutes} min read
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {article.view_count || 0} views
                        </div>
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ArticleLink>
              ))}
            </div>

            {getArticlesByCategory(category).length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No articles in this category yet</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
