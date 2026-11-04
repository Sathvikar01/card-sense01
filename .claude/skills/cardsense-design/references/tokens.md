# Tokens

Source of truth: `src/app/globals.css`. Tailwind exposes each role as `bg-*` / `text-*`.

## The four colours

Light theme only: there is no dark mode, and nothing reads `prefers-color-scheme`.

| Colour | Value | Role |
| --- | --- | --- |
| Paper | `#f4f3ef` | Ground (`--ground`) |
| White | `#ffffff` | Controls and floating layers (`--raised`) |
| Pine | `#16302b` | Ink: text and primary actions (`--ink`) |
| Gold | `#d9a93a` | Accent fill, always with pine text on top |

Derived, not extra colours: `--ink-muted` (ink mixed toward the ground: 7.4:1), `--tint` (ink at 6%, fills) and `--tint-strong` (ink at 11%, hover fills).

## Semantic roles (use these)

| Token | Use |
| --- | --- |
| `background` / `foreground` | Page ground and text |
| `card` | Inputs, option rows, menus, dialogs |
| `muted` / `muted-strong` | Quiet fills and their hover |
| `muted-foreground` | Secondary text |
| `primary` / `primary-foreground` | The one filled button |
| `accent` / `accent-foreground` | Selected state, gold chip |
| `inverse` / `inverse-foreground` | Compare bar, toasts (flips with the mode) |
| `ring` | Focus outline, 2px, offset 2px |

Gold fails contrast as text (2.2:1 on white). Never write text in gold; put pine text on gold (6.5:1).

## Type

| Role | Size / weight | Line height |
| --- | --- | --- |
| Display (landing h1) | 56 → 136px / 600, -0.05em, one line from 1024px | 0.9 |
| Page title | 28px / 600, -0.02em | 1.2 |
| Section | 18px / 600 | 1.2 |
| Body | 16px / 400 | 1.5 |
| Secondary | 14px / 400 | 1.5 |

Family: Hanken Grotesk Variable (`@fontsource-variable/hanken-grotesk`). Mono only for code. All figures are tabular.

## Motion

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Everything |
| `--duration-quick` | 150ms | Press, hover, colour |
| `--duration-standard` | 250ms | Menus, the compare bar |
| `--duration-slow` | 350ms | Dialogs, card lift |

Press scales to 0.96 on enabled controls. Framer Motion follows the OS setting through `MotionProvider`.

## Radius

Buttons and chips: full pill. Option rows, inputs: 16px / 12px. Dialogs: 24px. Card art: 12px.
