/**
 * Education Articles Database Seeder
 *
 * This script reads the credit education dataset and populates the Supabase database
 * with formatted articles. Run with: npm run seed:education
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  config({ path: envPath })
  console.log('✓ Loaded .env.local\n')
} else {
  console.warn('⚠️  No .env.local found, using system environment variables\n')
}

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

// Type definitions
interface DetailedExplanation {
  heading: string
  text: string
}

interface FAQ {
  question: string
  answer: string
}

interface ComparisonTable {
  description: string
  headers: string[]
  rows: string[][]
}

interface ArticleContent {
  introduction: string
  detailed_explanation: DetailedExplanation[]
  key_points: string[]
  practical_example?: string
  comparison_table?: ComparisonTable
  common_mistakes?: string[]
  pro_tips?: string[]
  real_world_scenarios?: Array<{ scenario: string; explanation: string }>
}

interface Article {
  id: string
  title: string
  difficulty: string
  content: ArticleContent
  faqs?: FAQ[]
}

interface Category {
  category_name: string
  description: string
  difficulty: string
  articles: Article[]
}

interface EducationDataset {
  metadata: {
    title: string
    description: string
    version: string
    last_updated: string
    categories: string[]
  }
  content: Record<string, Category>
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string, id: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + id.split('_')[1]
}

/**
 * Convert article content to Markdown format
 */
function convertToMarkdown(article: Article): string {
  const { content, faqs } = article
  let markdown = ''

  // Introduction
  if (content.introduction) {
    markdown += `${content.introduction}\n\n`
  }

  // Detailed explanations
  if (content.detailed_explanation && content.detailed_explanation.length > 0) {
    content.detailed_explanation.forEach((section) => {
      markdown += `## ${section.heading}\n\n`
      markdown += `${section.text}\n\n`
    })
  }

  // Key points
  if (content.key_points && content.key_points.length > 0) {
    markdown += `## Key Takeaways\n\n`
    content.key_points.forEach((point) => {
      markdown += `- ${point}\n`
    })
    markdown += `\n`
  }

  // Practical example
  if (content.practical_example) {
    markdown += `## Practical Example\n\n`
    markdown += `${content.practical_example}\n\n`
  }

  // Comparison table
  if (content.comparison_table) {
    markdown += `## ${content.comparison_table.description}\n\n`

    // Table headers
    markdown += `| ${content.comparison_table.headers.join(' | ')} |\n`
    markdown += `| ${content.comparison_table.headers.map(() => '---').join(' | ')} |\n`

    // Table rows
    content.comparison_table.rows.forEach((row) => {
      markdown += `| ${row.join(' | ')} |\n`
    })
    markdown += `\n`
  }

  // Common mistakes
  if (content.common_mistakes && content.common_mistakes.length > 0) {
    markdown += `## Common Mistakes to Avoid\n\n`
    content.common_mistakes.forEach((mistake) => {
      markdown += `- ⚠️ ${mistake}\n`
    })
    markdown += `\n`
  }

  // Pro tips
  if (content.pro_tips && content.pro_tips.length > 0) {
    markdown += `## Pro Tips\n\n`
    content.pro_tips.forEach((tip) => {
      markdown += `- 💡 ${tip}\n`
    })
    markdown += `\n`
  }

  // Real world scenarios
  if (content.real_world_scenarios && content.real_world_scenarios.length > 0) {
    markdown += `## Real-World Scenarios\n\n`
    content.real_world_scenarios.forEach((scenario, index) => {
      markdown += `### Scenario ${index + 1}: ${scenario.scenario}\n\n`
      markdown += `${scenario.explanation}\n\n`
    })
  }

  // FAQs
  if (faqs && faqs.length > 0) {
    markdown += `## Frequently Asked Questions\n\n`
    faqs.forEach((faq) => {
      markdown += `### ${faq.question}\n\n`
      markdown += `${faq.answer}\n\n`
    })
  }

  return markdown.trim()
}

/**
 * Calculate estimated reading time (words per minute = 200)
 */
function calculateReadTime(markdown: string): number {
  const wordCount = markdown.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Extract tags from article content
 */
function extractTags(article: Article, category: string): string[] {
  const tags = new Set<string>()

  tags.add(category)
  tags.add(article.difficulty)

  // Extract from title
  const titleWords = article.title.toLowerCase().split(' ')
  titleWords.forEach(word => {
    if (word.length > 4 && !['credit', 'card', 'cards'].includes(word)) {
      tags.add(word)
    }
  })

  return Array.from(tags).slice(0, 5)
}

/**
 * Create summary from introduction
 */
function createSummary(introduction: string): string {
  const sentences = introduction.split(/[.!?]/)
  const summary = sentences.slice(0, 2).join('.').trim()
  return summary.length > 200 ? summary.substring(0, 197) + '...' : summary + '.'
}

/**
 * Main seeding function
 */
async function seedEducation() {
  try {
    console.log('🌱 Starting education articles seeding...\n')

    // Read the full dataset
    const datasetPath = join(process.cwd(), 'credit_education_full_dataset.json')
    const rawData = readFileSync(datasetPath, 'utf-8')
    const dataset: EducationDataset = JSON.parse(rawData)

    console.log(`📚 Dataset: ${dataset.metadata.title}`)
    console.log(`📅 Version: ${dataset.metadata.version} (${dataset.metadata.last_updated})`)
    console.log(`📂 Categories: ${dataset.metadata.categories.join(', ')}\n`)

    // Process each category
    const allArticles: any[] = []
    let totalArticles = 0

    for (const [categoryKey, categoryData] of Object.entries(dataset.content)) {
      console.log(`📖 Processing category: ${categoryData.category_name} (${categoryData.articles.length} articles)`)

      for (const article of categoryData.articles) {
        const slug = generateSlug(article.title, article.id)
        const markdown = convertToMarkdown(article)
        const readTime = calculateReadTime(markdown)
        const tags = extractTags(article, categoryKey)
        const summary = createSummary(article.content.introduction)

        const articleRecord = {
          slug,
          title: article.title,
          summary,
          category: categoryKey,
          difficulty: article.difficulty,
          content: markdown,
          read_time_minutes: readTime,
          tags,
          is_published: true,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        allArticles.push(articleRecord)
        totalArticles++

        console.log(`  ✓ ${article.title} (${readTime} min read)`)
      }

      console.log('')
    }

    // Insert all articles into database
    console.log(`💾 Inserting ${totalArticles} articles into database...\n`)

    const { data, error } = await supabase
      .from('education_articles')
      .upsert(allArticles, { onConflict: 'slug' })

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('table')) {
        console.error('❌ Table "education_articles" does not exist!\n')
        console.log('📝 Please create the table first:')
        console.log('   1. Go to Supabase Dashboard → SQL Editor')
        console.log('   2. Run the SQL from: supabase/migrations/create_education_articles.sql')
        console.log('   3. Then run this script again\n')
        console.log('💡 See EDUCATION_SETUP.md for detailed instructions\n')
      } else {
        console.error('❌ Database error:', error)
      }
      process.exit(1)
    }

    console.log('✅ Successfully seeded all education articles!')
    console.log(`\n📊 Summary:`)
    console.log(`   Total articles: ${totalArticles}`)
    console.log(`   Categories: ${Object.keys(dataset.content).length}`)
    console.log(`   Average read time: ${Math.round(allArticles.reduce((sum, a) => sum + a.read_time_minutes, 0) / totalArticles)} minutes`)
    console.log(`\n🎉 Seeding complete!`)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeder
seedEducation()
