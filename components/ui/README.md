# `components/ui/` — Base-UI primitive component library

34 unstyled-but-themed primitives composing the design system. All are
built on `@base-ui/react` (+ `recharts` for chart, `embla-carousel-react`
for carousel, `@hugeicons/react` for icons) and styled via `cn()`
(`lib/utils.ts`). `flickering-grid` is the one exception — it comes from the
Magic UI registry (registered as `@magicui` in `components.json`) and draws to a
`<canvas>`. Rules of thumb:

- `Button` uses `render={<Link>}` + `nativeButton={!render}` (never
  `asChild`) — Base UI injects native-button semantics otherwise.
- `Tooltip` needs `TooltipProvider` in the tree; it is mounted once in
  `app/layout.tsx`.
- `DropdownMenuLabel` must sit inside `DropdownMenuGroup` (or a radio
  group); bare labels throw at runtime.
- `Questionnaire.Progress` must render inside `<Questionnaire>` (the Root).

## Files

Forms & input: `button`, `button-group`, `input`, `input-group`, `textarea`,
`label`, `field`, `checkbox`, `switch`, `toggle`, `calendar`.
Feedback & overlays: `alert`, `alert-dialog`, `tooltip`, `popover`,
`dropdown-menu`, `sheet`, `skeleton`, `carousel`.
Data display: `avatar`, `badge`, `card`, `table`, `chart`, `item`,
`attachment`, `breadcrumb`, `separator`, `tabs`, `collapsible`,
`scroll-area`, `questionnaire`, `sidebar`, `flickering-grid`.

## Connections

- Consumed by every feature folder. Styling tokens from `app/globals.css`.
- Backdrop usage (circuit board vs. flickering grid) is documented in
  `app/README.md` → *Backdrops*.
