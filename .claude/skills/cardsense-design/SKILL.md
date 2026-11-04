---
name: cardsense-design
description: CardSense's design language. Use for any UI change in this repo — a new page, a component, copy, colour, motion or a review — so the result matches the rest of the app. Generated with hue from the codebase; tokens live in src/app/globals.css.
---

# CardSense design language

## Philosophy

A quiet ledger for one decision: which credit card. The interface is paper and ink, like a bank passbook or Apple Notes, so the only colourful things on screen are the cards themselves and the single gold chip that marks what you chose. The tension is warmth against restraint: a warm paper ground and a friendly grotesk, held back by almost no decoration.

## Principles

1. **One purpose per screen.** Every page answers one question; if it needs a subtitle to explain itself, the layout is wrong.
2. **Space separates, lines don't.** No borders, dividers or panels; groups are a heading and the space around them.
3. **Words over icons.** Actions are verbs ("Remove", "Compare", "Back"); the app draws only a chevron, a tick and its logo.
4. **Gold means chosen.** The accent fills only the selected answer, the active filter, the top match score, the avatar and the logo chip.
5. **Type carries the numbers.** Money and scores are type with tabular figures, never tiles, gauges or charts.
6. **Forgiving by default.** Removals act at once and offer Undo; forms validate on submit with the error next to the field.
7. **Follows the system.** One light theme on purpose; motion follows "reduce motion", and nothing autoplays.

## Craft rules

**Hierarchy**

| Layer | Treatment |
| --- | --- |
| Page title | `PageHeader`, 28px / 600, one per page |
| Section | `Section`: 18px / 600 heading, content straight on the paper, 48px between sections |
| Row | `.row`: 12px padding, space between rows, faint tint on hover |
| Body | 16px / 400, ink |
| Secondary | 14px, `text-muted-foreground` (7:1 on the ground) |

**Typography.** One family, Hanken Grotesk (self-hosted). Three sizes do almost everything: 28, 18, 16 (14 for secondary). Weights 400 and 600 only; 500 for button labels.

**Spacing.** 4px base. 8–12px inside a group, 24px+ between groups, 48px between sections. Content column is 768px.

**Colour.** Four colours, mapped to semantic tokens. Components never name a colour, only a role (`bg-accent`, `text-muted-foreground`). See `references/tokens.md`.

**Composition.** Every app page is `PageHeader`, an optional row of figures, then at most three `Section`s. The landing page (`components/landing/`) is light like everything else: a centred hero (headline of seven words with its promise on a gold highlight, one sentence, two actions) over two rows of real card art drifting in opposite directions (`.marquee-*` in globals.css; still for reduced motion). Then the estimator section, the page's one live thing: pick your biggest spend and the two best cards trade places (`estimator.tsx`, rates in `hero-cards.ts`, shared with the iOS app). Then four facts beside a generated still life graded to the paper, and a one-line footer. No dark sections. Card art is always shown whole, never cropped.

**Squint test.** Blur your eyes: you should see a title, a few blocks of text, and maybe one gold spot. If you see boxes or lines, remove them.

## Anti-patterns

- No borders, dividers, separators or hairlines, including chart axes and progress tracks.
- No white panels or cards around content.
- No icons from a library (no lucide, no emoji); use words or `Chevron`/`Tick`.
- No taglines, eyebrows, subtitles or helper text under titles.
- No "·"-joined meta strings; put facts in separate spans with a gap.
- No raw colours (`#hex`, `bg-gray-500`, `bg-gold`) in components; only semantic tokens.
- No charts; a short list of numbers says it.
- No more than one filled (primary) button per view.
- No disabled submit buttons as validation; validate on submit.
- No confirmation dialog for reversible actions; act and offer Undo. Account deletion asks the user to type "delete".
- No animation that ignores `prefers-reduced-motion`, and nothing that moves on its own.
- No `transition-all`; name the properties.

## Workflow

1. Read `references/tokens.md` and `references/components.md`.
2. Build from `PageHeader`, `Section`, `.row`, `EmptyState`, `BackLink`, `Button`, `ToggleGroup`, `Skeleton`.
3. Give every data region four states: loading (`Skeleton`), empty (`EmptyState`), error (what broke, how to recover) and full.
4. Check 390px and 1440px, keyboard only.
5. Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
