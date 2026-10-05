# `components/favorites/` — Saved-developers UI and state

Everything about favoriting developers: the context provider, list, toolbar
and header. Persistence is localStorage (`lib/favorites/storage.ts`,
`gdd:favorites` key); the GitHub API is only used to refresh stale cards.

## Files

- `favorites-provider.tsx` — `FavoritesProvider` + context. Holds the saved
  `GitHubUserSummary[]`, syncs localStorage (including cross-tab `storage`
  events), and exposes `add/remove/toggle/replace/clearAll/isFavorite`.
  State is hydrated via `useSyncExternalStore` (no setState-in-effect).
  Mounted in the root `app/layout.tsx` so every route (incl. 404) can use it.
- `favorites-list.tsx` — Renders saved users as `DeveloperResultCard`s
  inside a `ScrollArea`. Empty state links back to search.
- `favorites-toolbar.tsx` — Filter `InputGroup`, `DropdownMenu` sort
  (recently saved, followers, repos, name) and a clear-all `AlertDialog`
  confirm. Sort/filter state is lifted to the favorites page.
- `favorites-header.tsx` — Count heading + description for the page.

## Connections

- Hook façade: `hooks/use-favorites.ts`. Refresh action:
  `lib/github/actions.ts`. Toggle buttons: `components/shared/`.
