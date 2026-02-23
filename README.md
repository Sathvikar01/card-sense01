# CardSense India 🃏

A smart credit card management and advisory platform for Indian users — built with Next.js, Supabase, and Google Gemini AI.

## Features

- **Dashboard** – Overview of your cards, spending, and recommendations
- **Card Management** – Track all your credit cards in one place
- **AI Advisor** – Get personalized credit card advice powered by Google Gemini
- **Spending Analytics** – Visualize and analyze your spending patterns
- **Recommendations** – Discover new credit cards tailored to your profile
- **Education Hub** – Learn about credit cards, CIBIL scores, rewards, fees, and more
- **Beginner Guide** – Step-by-step guide for first-time credit card users
- **Profile & Settings** – Manage your account and preferences

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn/ui |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL) |
| AI | [Google Gemini](https://ai.google.dev/) |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- A [Google AI](https://ai.google.dev/) API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sathvikar01/card-sense01.git
   cd card-sense01
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Set up the database**

   Run the following SQL migration files in order in your Supabase SQL Editor:

   1. `supabase/migrations/001_initial_schema.sql`
   2. `supabase/migrations/002_rls_policies.sql`
   3. `supabase/migrations/003_triggers.sql`
   4. `supabase/migrations/004_storage_buckets.sql`
   5. `supabase/migrations/005_credit_cards_seed.sql`
   6. `supabase/migrations/006_education_seed.sql`
   7. `supabase/migrations/007_performance_indexes.sql`
   8. `supabase/migrations/create_education_articles.sql`

5. **Seed education articles** *(optional)*

   ```bash
   npm run seed:education
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run seed:education` | Seed education articles into Supabase |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages (login, signup)
│   ├── (dashboard)/     # Main app pages (dashboard, cards, advisor, etc.)
│   └── api/             # API routes
├── components/          # Reusable UI components
├── data/                # Static data and constants
├── lib/                 # Utility functions and Supabase client
├── store/               # Zustand state stores
└── types/               # TypeScript type definitions
```

## License

This project is private.
