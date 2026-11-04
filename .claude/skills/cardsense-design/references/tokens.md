# Tokens

Source of truth: `src/app/globals.css`. Tailwind exposes each role as `bg-*` / `text-*`.

## The four colours

| Colour | Light | Dark | Role |
| --- | --- | --- | --- |
| Paper | `#f4f3ef` | `#0e1714` | Ground (`--ground`) |
| White | `#ffffff` | `#16221e` | Controls and floating layers (`--raised`) |
| Pine | `#16302b` | `#ecebe6` | Ink: text and primary actions (`--ink`) |
| Gold | `#d9a93a` | `#d9a93a` | Accent fill, always with pine text on top |

Derived, not extra colours: `--ink-muted` (ink mixed toward the ground: 7.4:1 light, 7.9:1 dark), `--tint` (ink at 6–8%, fills) and `--tint-strong` (ink at 11–14%, hover fills).

## Semantic roles (use these)

| Token | Use |
| --- | --- |
| `background` / `foreground` | Page ground and text |
| `card` | Inputs, option rows, menus, dialogs |
| `muted` / `muted-strong` | Quiet fills and their hover |
| `muted-foreground` | Secondary text |
| `primary` / `primary-foreground` | The one filled button |
| `accent` / `accent-foreground` | Selected state, gold chip |
| `inverse` / `inverse-foreground` | The landing field, compare bar, toasts |
| `ring` | Focus outline, 2px, offset 2px |

Gold fails contrast as text (2.2:1 on white). Never write text in gold; put pine text on gold (6.5:1).

## Type

| Role | Size / weight | Line height |
| --- | --- | --- |
| Display (landing h1) | 44 → 88px / 600, -0.035em | 1.05 |
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
