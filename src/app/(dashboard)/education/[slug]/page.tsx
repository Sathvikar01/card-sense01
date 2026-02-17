import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { createPublicServerClient } from '@/lib/supabase/public-server'
import { ArticleLink } from '@/components/education/article-link'
import { ArticleViewTracker } from '@/components/education/article-view-tracker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => (
    <div className="space-y-3">
      <div className="h-4 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
    </div>
  ),
})

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

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = createPublicServerClient()

  const { data: article } = await supabase
    .from('education_articles')
    .select('id, slug, title, summary, category, difficulty, read_time_minutes, created_at, tags, content')
    .eq('slug', params.slug)
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

  return (
    <div className="space-y-6">
      <ArticleViewTracker slug={params.slug} />

      <div className="flex items-center gap-2">
        <Link href="/education">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <article>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{article.category}</Badge>
                <Badge className={getDifficultyColor(article.difficulty)}>
                  {article.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {article.read_time_minutes} min read
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.created_at).toLocaleDateString('en-IN')}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>

              <p className="text-xl text-gray-600">{article.summary}</p>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-gray max-w-none">
                  <ReactMarkdown>{article.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </article>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Related Articles</h3>
              {relatedArticles && relatedArticles.length > 0 ? (
                <div className="space-y-3">
                  {relatedArticles.map((related) => (
                    <ArticleLink
                      key={related.id}
                      href={`/education/${related.slug}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1">{related.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {related.category}
                        </Badge>
                        <span>{related.read_time_minutes} min</span>
                      </div>
                    </ArticleLink>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No related articles found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
