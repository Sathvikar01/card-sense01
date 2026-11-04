# Components

All live in `src/components`. Use them before writing markup.

| Component | File | Notes |
| --- | --- | --- |
| `PageHeader` | `shared/page-header.tsx` | Title and optional actions. No description prop. |
| `Section` | `shared/section.tsx` | 18px heading, optional text action on the right, content on the paper. |
| `.row` | `app/globals.css` | List row: padding, hover tint, no divider. Use on `li`, `a` or `label`. |
| `EmptyState` | `shared/empty-state.tsx` | Short title plus one action. `primary` only for the page's main action. |
| `BackLink` | `shared/back-link.tsx` | Text link to the parent list ("All cards"). |
| `Button` | `ui/button.tsx` | `default` (filled, one per view), `outline` (tint), `ghost`, `accent`, `inverse`. |
| `ToggleGroup` | `ui/toggle-group.tsx` | Every pick-one set: `chip`, `option` (Advisor answers), `plain` (topics). |
| `Skeleton` | `ui/skeleton.tsx` | Loading placeholder in the shape of the content. |
| `Chevron`, `Tick` | `shared/glyph.tsx` | The only drawn marks. |
| `.tap` | `app/globals.css` | Extends a small text control's hit area to about 44px. |
| `CreditCardVisual` | `cards/credit-card-visual.tsx` | The card art. Its colours are product data, not UI tokens. |

## Patterns

- **Remove:** call the API, refresh, then `toast('X removed', { action: { label: 'Undo', onClick } })`.
- **Form error:** keep submit enabled; on submit set an error, render `<p id="…-error" role="alert">` under the field and point `aria-describedby` at it.
- **Error copy:** "Unable to <what>. Check your connection and try again."
- **Figures:** a `dl` of label under value, values at 24px / 600.
