# `lib/favorites/` — Favorites persistence helpers

Single file for the localStorage contract behind `FavoritesProvider`.

## Files

- `storage.ts` — `FAVORITES_STORAGE_KEY` (`gdd:favorites`), parse on load
  (tolerant of corrupt JSON), stringify on save.

## Connections

- Used by `components/favorites/favorites-provider.tsx`; surfaced via
  `hooks/use-favorites.ts`.
