import { createPublicServerClient } from '@/lib/supabase/public-server'
import { EducationRoutePrefetch } from '@/components/education/education-route-prefetch'
import { EducationLibrary } from '@/components/education/education-library'

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

  const topSlugs = (articles || []).slice(0, 6).map((article) => article.slug)

  return (
    <div className="space-y-8">
      <EducationRoutePrefetch slugs={topSlugs} />
      <EducationLibrary articles={articles || []} />
    </div>
  )
}
