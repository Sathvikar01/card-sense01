# Education Articles Database Setup

This guide will help you set up and populate the education articles section.

## Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the content from `supabase/migrations/create_education_articles.sql`
6. Click **Run** to execute the migration

### Already created the table?

If you already created the table before this update, you need to fix the difficulty constraint:

1. Go to **SQL Editor**
2. Copy and paste the content from `supabase/migrations/fix_difficulty_constraint.sql`
3. Click **Run**

This adds support for `beginner_to_intermediate` and `intermediate_to_advanced` difficulty levels.

## Step 2: Populate Articles

After creating the table, run the seeder script:

```bash
npm run seed:education
```

This will:
- Read the `credit_education_full_dataset.json`
- Transform each article into markdown format
- Insert all 11 articles into the database

## Step 3: Verify

1. Visit `/education` in your app to see all articles
2. Click on any article to view the full content
3. Check that view counts increment as you browse

## Article Categories

The dataset includes articles across 6 categories:

- **basics** - Credit Card Basics (4 articles)
- **CIBIL** - CIBIL and Credit Scores (2 articles)
- **rewards** - Credit Card Rewards (2 articles)
- **fees** - Fees and Charges (1 article)
- **security** - Security Best Practices (1 article)
- **tips** - Smart Usage Tips (1 article)

## Troubleshooting

### Table already exists error
If you see "relation already exists", the table is already created. Skip to Step 2.

### Permission errors
Make sure your `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### Articles not showing
Check that `is_published` is set to `true` in the database (the seeder does this automatically)
