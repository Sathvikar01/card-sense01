<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CardSense

Helps people in India pick a credit card for how they spend. Next.js App Router, Supabase (auth + data), Gemini (advisor + chat), Tailwind 4.

## Map

- `src/app/page.tsx`: public landing page.
- `src/app/(auth)/*`: sign in, sign up, password reset.
- `src/app/(dashboard)/*`: the signed-in app. Five destinations, defined once in `src/components/layout/nav-items.ts`: Home, Advisor, Cards, Spending, Learn. Profile, Settings and Chat open from the account menu. One shared `loading.tsx` and `error.tsx`.
- `src/app/api/*`: route handlers. `ai/recommend` scores cards; `recommendations/latest` stores the last result.
- `src/lib/recommendations/map-advisor-cards.ts`: the only place API card rows become `SavedAdvisorCard`.

## UI rules

The bar is Linear / Apple Notes: one purpose per screen, nothing decorative.

- No taglines, eyebrows, subtitles or helper text. If a screen needs one to make sense, change the layout. `PageHeader` has no description prop on purpose.
- Colors come from tokens in `src/app/globals.css` (`foreground`, `muted-foreground`, `border`, `muted`, `card`, `primary`, `accent`, `destructive`). No hex values or Tailwind palette colors (`gray-*`, `blue-*`) in components. SVG and Recharts need literal colors: import them from `src/lib/theme.ts`.
- Bordered panels use `.surface`. Lists inside one use `divide-y divide-border`. Loading placeholders use `.shimmer`. Rendered Markdown uses `.markdown`.
- Labels and buttons use sentence case and short verbs: "Save", "Add card", "Compare". Toasts report failures; skip success toasts when the UI already shows the change.
- Page titles: set `metadata.title` to the bare page name. The root layout adds "· CardSense".

## Commands

```bash
npm run dev        # local server
npm run lint
npm run typecheck
npm run build
npm run test:e2e   # Playwright; needs `npm run build` first
```

E2E tests mock the API routes and send `x-cardsense-e2e` to skip auth. Advisor tests use `answerAdvisor` in `tests/helpers/ui.ts`.
