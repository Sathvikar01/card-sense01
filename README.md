# CardSense India 💳

An intelligent credit education platform designed to help users in India understand credit scores, credit cards, and financial best practices. Built with modern web technologies and powered by AI-driven insights.

## 🌟 Features

- **Interactive Credit Education** - Comprehensive guides on credit basics, CIBIL scores, credit card rewards, and fees
- **Article Management** - Browse, search, and track educational content
- **User Authentication** - Secure login with Supabase
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark/Light Theme** - Built-in theme switching support
- **Database-Driven Content** - Scalable content management with Supabase

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Shadcn/UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Google GenAI API
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **PDF Processing**: pdf-parse
- **Charts**: Recharts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- Git
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Google GenAI API key (optional, for AI features)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cardsense-india.git
cd cardsense-india
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google GenAI (optional)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

### 4. Database Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use an existing one
3. Navigate to the SQL Editor
4. Run the SQL migration from `supabase-schema.sql`:
   - Copy the entire schema file
   - Paste it in the SQL Editor
   - Click **Run**

### 5. Populate Education Articles (Optional)

To populate the database with educational content:

```bash
npm run seed:education
```

This will:
- Read articles from `credit_education_full_dataset.json`
- Transform them to markdown format
- Insert them into your Supabase database

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📚 Education Content

The platform includes comprehensive articles across 6 categories:

- **Basics** - Credit Card Fundamentals (4 articles)
- **CIBIL** - Understanding CIBIL & Credit Scores (2 articles)  
- **Rewards** - Maximizing Credit Card Rewards (2 articles)
- **Fees** - Understanding Fees & Charges (1 article)
- **Advanced** - Advanced Credit Topics (Coming soon)

## 📁 Project Structure

```
cardsense-india/
├── src/
│   ├── app/                 # Next.js pages and layouts
│   ├── components/          # Reusable React components
│   ├── data/                # Static data files
│   ├── lib/                 # Utility functions & helpers
│   ├── types/               # TypeScript type definitions
│   ├── store/               # Zustand state management
│   └── middleware.ts        # Next.js middleware
├── public/                  # Static assets
├── supabase/                # Supabase migrations
├── scripts/                 # Utility scripts
│   ├── seed-education.ts    # Database seeding script
│   └── verify-schema.ts     # Schema verification script
├── .env.local               # Local environment variables (git ignored)
├── supabase-schema.sql      # Database schema
└── package.json             # Dependencies & scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build            # Build for production
npm start                # Start production server

# Testing & Linting
npm run lint             # Run ESLint

# Database
npm run seed:education   # Populate education articles
npm run schema:verify    # Verify database schema
```

## 🗄️ Database Schema

The main tables include:

- **users** - User profiles and authentication
- **education_articles** - Educational content
  - id, title, slug, content, category
  - difficulty_level, views, created_at, updated_at
- Additional tables for tracking user progress (coming soon)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and commit (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's linting rules:

```bash
npm run lint
```

## 📦 Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New** → **Project**
4. Select your repository
5. Set environment variables in the project settings
6. Click **Deploy**

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- AWS (EC2, Lambda, Amplify)
- DigitalOcean
- Any Node.js hosting provider

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your Supabase credentials in `.env.local`
- Check that your Supabase project is active
- Ensure firewall rules allow your IP address

### Build Errors
```bash
# Clear Next.js cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Make sure the file is named `.env.local` (not `.env`)
- Restart the dev server after changing variables
- Variables must start with `NEXT_PUBLIC_` to be accessible in the browser

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💼 Author

CardSense India - Building Financial Literacy in India

## 📞 Support

For issues, questions, or suggestions, please:
- Open an issue on GitHub
- Contact the development team
- Check existing documentation

---

**Made with ❤️ for financial education in India**
