/**
 * Create education_articles table
 * Run with: npm run db:setup
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  config({ path: envPath })
  console.log('✓ Loaded .env.local\n')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up education_articles table...\n')

    const sqlPath = join(process.cwd(), 'supabase', 'migrations', 'create_education_articles.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
.filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

      if (error) {
        // Try direct execution if RPC fails
        console.log('ℹ️  Running migration directly...')
        const { error: directError } = await supabase.from('_sql').select(statement as any)

        if (directError) {
          console.error('❌ Migration error:', directError)
          console.log('\n📝 Please run this SQL manually in your Supabase dashboard:')
          console.log('\n' + sql + '\n')
          process.exit(1)
        }
      }
    }

    console.log('✅ Database setup complete!')
    console.log('\n💡 Next step: Run "npm run seed:education" to populate articles\n')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    console.log('\n📝 Please create the table manually using the SQL in:')
    console.log('   supabase/migrations/create_education_articles.sql\n')
    process.exit(1)
  }
}

setupDatabase()
