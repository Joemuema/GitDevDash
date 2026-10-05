# `components/shared/` — Cross-cutting shared components

Small components used from more than one feature folder (search, profile,
repo, favorites).

## Files

- `favorite-button.tsx` — Save/unsave `Toggle` (star icon) with `Tooltip`
  (`Save …` / `Remove …`), `pressed={isFavorite}` wired to
  `useFavorites()`. Used in result cards, profile header and repo page.
- `developer-breadcrumb.tsx` — Search → developer → repo breadcrumb trail.
- `github-external-link.tsx` — External GitHub link with icon and
  `target="_blank" rel="noreferrer"`.

## Connections

- State: `hooks/use-favorites.ts`. Routes: `lib/routes.ts`.
