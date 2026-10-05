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

## Subfolders

- `(app)/` — All user-facing pages, wrapped in the shared `AppShell`
  (sidebar, header, onboarding gate). See `(app)/README.md`.
- `api/` — Server-only route handlers (no UI). See `api/README.md`.
