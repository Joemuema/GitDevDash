# `app/(app)/search/` — Developer search results page

Route: `/search?q=...&page=...&sort=...&order=...&language=...&location=...&reposMin=...&joinedAfter=...`.

## Files

- `page.tsx` — Async server component. Parses URL params with
  `parseAppSearchParams` (`lib/search/params.ts`), calls `searchUsers`
  (`lib/github/users.ts`, enriched with full profiles via `getUser`), and
  renders `SearchContextBar` (result count + sort select),
  `ActiveFilters` (removable filter chips), `SearchResultsList`
  (of `DeveloperResultCard`s) and `SearchPagination`. Empty query redirects
  home; API errors render an `Alert`.
- `loading.tsx` — Skeleton fallback shown while results stream in.

## Connections

- Query building/serialization lives in `lib/search/params.ts`;
  result cards in `components/search/`; badges/tooltips from `components/ui/`.
