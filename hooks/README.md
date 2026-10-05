# `hooks/` — Client-side React hooks

Tiny facades over the context providers mounted in `app/layout.tsx`. All
are `"use client"` and throw a clear error when used outside their
provider.

## Files

- `use-auth.ts` — `useAuth()` → current user + loading state from
  `AuthProvider` (`components/auth/auth-provider.tsx`). Used by
  `SiteHeader`, `AccountMenu`, settings and account forms.
- `use-favorites.ts` — `useFavorites()` (list, count, add/remove/toggle/
  replace/clearAll, readiness) and `useFavoriteUser(login)` convenience
  from `FavoritesProvider`. Used by `FavoriteButton`, result cards and the
  favorites page.
- `use-mobile.ts` — `useIsMobile()` via `useSyncExternalStore` media-query
  subscription (SSR-safe). Used by sidebar/carousel responsive behaviour.
