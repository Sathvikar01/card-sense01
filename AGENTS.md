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

The bar is Linear / Apple Notes: one purpose per screen, nothing decorative. These come from the Impeccable, Taste v2, Interface Design and Emil Kowalski skills.

- **Four colours, no more** (`src/app/globals.css`): `paper` ground, `white` panels, `pine` text and primary actions, `gold` accent. Muted text, fills and the rare line are pine at lower strength. Gold is a fill only (selection, data, the active-nav chip), always with pine on top; it fails contrast as text. SVG/Recharts literals: `src/lib/theme.ts`.
- **No lines.** Panels are white on paper with no border; rows inside are separated by space (`.row`), not dividers. Inputs are tinted fills, not outlines. Shadows only on things that float (menus, dialogs, toasts, the compare bar).
- **No icon library.** Say it in words ("Remove", "Back", "Close", "Send"). The only drawn marks are `Chevron` and `Tick` in `src/components/shared/glyph.tsx`, plus the logo.
- **One layout.** Every app page is `PageHeader` then a column of `Section` blocks (`src/components/shared/section.tsx`) inside a 768px column. Totals sit inside the section they explain; no KPI strips.
- **No taglines, eyebrows, subtitles or helper text.** `PageHeader` has no description prop on purpose.
- **Type:** Hanken Grotesk only, self-hosted from Fontsource. Page titles 28px/600, section titles 15px/600, body 15px, money uses tabular figures.
- **Motion:** under 300ms, custom ease-out (`--ease-out`), `scale(0.97)` on press, nothing on keyboard-driven actions.
- Labels and buttons use sentence case and short verbs. Toasts report failures; skip success toasts when the UI already shows the change.
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
