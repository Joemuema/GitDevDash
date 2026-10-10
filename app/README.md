# `app/` — Routes, layouts and API endpoints

This is the Next.js App Router entry point. Special files (`layout.tsx`,
`page.tsx`, `route.ts`, `loading.tsx`, `not-found.tsx`) define the URL tree;
everything else lives in `components/`, `lib/` and `hooks/`.

## Files

- `layout.tsx` — Root layout (`<html>`/`<body>`, fonts, global CSS). It is
  `async`: it calls `getCurrentUser()` from `lib/auth/dal.ts` and provides the
  result via `AuthProvider`, plus `FavoritesProvider` and `ThemeProvider`.
  Providers live here (not in `(app)/layout.tsx`) so `not-found.tsx` — which
  renders outside the `(app)` group — can still use auth and favorites.
- `globals.css` — Tailwind v4 entry point and design tokens.
- `not-found.tsx` — Global 404 page. Renders `AppShell` + `SiteHeader`, so it
  depends on the root providers above. Must stay provider-free itself.

## Backdrops

Two premade patterns are used; which one appears depends on the route.

**Every page except home — circuit board.** `components/layout/page-backdrop.tsx`
renders a fixed layer using the Hero Patterns _Circuit Board_ artwork, stored
locally as `public/circuit-board.svg` (304×304, CC BY 4.0). It is applied as a
CSS **mask** with `background-color: var(--foreground)`, so a single asset serves
both themes instead of needing a light and dark copy.

Its strength and scale are tuned in two places in `app/globals.css`:

| Knob                | Where               | Value                     |
| ------------------- | ------------------- | ------------------------- |
| `--circuit-opacity` | `:root` / `.dark`   | `0.05` light, `0.04` dark |
| `mask-size`         | `.circuit-backdrop` | `200px 200px`             |

The opacity is deliberately very low and the tile is scaled **down** to `200px`
(roughly 0.66x the artwork's native `304px`) so the motifs read smaller. At
opacity and native scale the circuit reads as busy line work that competes
with page content.

**Home only — flickering grid.** `components/search/home-flicker.tsx` wraps the
Magic UI `FlickeringGrid` (installed via `shadcn add @magicui/flickering-grid`
into `components/ui/flickering-grid.tsx`). It paints to a `<canvas>`, so it must
be a Client Component; it resolves the square colour from the active theme
because `canvas.fillStyle` does not accept `currentColor`. It lives inside a
rounded hero panel on `app/(app)/page.tsx` rather than filling the viewport.

### Important: the inset must be transparent

Both backdrops sit _behind_ content, so any full-bleed wrapper painted
`bg-background` will hide them. `SidebarInset` (in `components/ui/sidebar.tsx`)
defaults to `bg-background`, which is why `app-shell.tsx` passes
`bg-transparent`. If a new full-page wrapper is added, give it `bg-transparent`
too.

Cards and list surfaces sit at 90% (`bg-card/90`) so the backdrop texture shows
through faintly while text stays legible: the home hero panel
(`app/(app)/page.tsx`), `DeveloperResultCard`, `RepositoryListItem`, the
`ReposCarousel` cards, and the dropdown menus (`bg-popover/75`). Popovers and
the sticky header keep their own opaque backgrounds on purpose.

To change the circuit artwork, replace `public/circuit-board.svg` — it is
referenced by path, not by content, so nothing else needs editing.

## Subfolders

- `(app)/` — All user-facing pages, wrapped in the shared `AppShell`
  (sidebar, header, onboarding gate). See `(app)/README.md`.
- `api/` — Server-only route handlers (no UI). See `api/README.md`.
