# `app/(app)/` — User-facing pages under the shared shell

The `(app)` segment is a route group: it adds no URL prefix, but its
`layout.tsx` wraps every page below in `AppShell` (sidebar, header,
onboarding gate).

## Files

- `layout.tsx` — Thin wrapper: `<AppShell>{children}</AppShell>`.
- `page.tsx` — Home page (`/`): `SearchHero` + `SearchForm` + `HomeGuidance`.
  The entry point for starting a developer search.

## Subfolders

- `developers/` → `/developers/[username]` (+ `/repos/[repo]`) — profile and
  repository detail pages backed by `lib/github/`.
- `search/` → `/search` — results page driven by URL params parsed in
  `lib/search/params.ts`.
- `favorites/` → `/favorites` — client page reading `FavoritesProvider`.
- `settings/` → `/settings` — tabbed settings (appearance, notifications,
  data) plus account management.
