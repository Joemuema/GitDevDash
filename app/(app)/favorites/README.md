# `app/(app)/favorites/` — Saved developers page

Route: `/favorites`. Client-rendered (`"use client"`).

## Files

- `page.tsx` — Reads saved logins from `FavoritesProvider`
  (`components/favorites/`), then revalidates each via the
  `refreshFavoriteUsers` server action (`lib/github/actions.ts`) so cards
  show fresh stats. Renders `FavoritesHeader` (count), `FavoritesToolbar`
  (filter input, dropdown sort, clear-all confirm dialog) and
  `FavoritesList` (of `DeveloperResultCard`s). A `fetchedLoginsRef` guard
  prevents the refresh effect from looping.

## Connections

- State: `hooks/use-favorites.ts` → `FavoritesProvider` (localStorage,
  `lib/favorites/storage.ts`). Cards and toolbar are shared with search.
