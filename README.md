# CardSense

Find the right Indian credit card for how you spend.

- **Advisor**: five quick questions and your monthly spend, then a ranked shortlist with the reasoning for each card.
- **Cards**: browse, filter and compare up to three cards side by side.
- **Spending**: log what you spend by category to improve matches.
- **Learn**: short lessons on credit, CIBIL, rewards and fees.

## Run locally

Requires Node 20+ and a Supabase project.

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
```

Apply the SQL in `supabase/migrations` (CI uses `npm run ci:migrations`), then load content:

```bash
npm run seed:education
npm run migrate:cards
```

Start the app:

```bash
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Architecture, UI rules and conventions for contributors and coding agents are in [AGENTS.md](AGENTS.md).

## License

MIT
