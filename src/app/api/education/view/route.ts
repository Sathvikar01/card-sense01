import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

interface EducationArticleRow {
  id: string
}

interface EducationViewRpcClient {
  rpc: (
    name: 'increment_article_views',
    args: { article_id: string }
  ) => Promise<{ error: { message: string } | null }>
}

const trackViewSchema = z.object({
  slug: z.string().min(1).max(200),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = trackViewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request payload' }, { status: 400 })
    }

    const { slug } = parsed.data
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ message: 'Missing service role key' }, { status: 500 })
    }

    const supabase = createAdminClient()

    const { data: article } = (await supabase
      .from('education_articles')
      .select('id')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()) as { data: EducationArticleRow | null }

    if (!article) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 })
    }

    const { error } = await (supabase as unknown as EducationViewRpcClient).rpc(
      'increment_article_views',
      { article_id: article.id }
    )

    if (error) {
      return NextResponse.json({ message: 'Failed to update view count' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
