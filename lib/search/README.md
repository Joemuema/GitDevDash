# `lib/search/` — Search URL param logic

Single file translating between the search page's URL and the GitHub user
search query.

## Files

- `params.ts` — `AppSearchParams` (`q`, `page`, `sort`, `order`, `language`,
  `location`, `reposMin`, `joinedAfter`); `parseAppSearchParams` (validate +
  defaults); `buildGitHubUserSearchQuery` (`location:` / `language:` /
  `repos:>=N` / `created:>` qualifiers); `githubSearchSort` (app sort →
  API sort/order); `searchUrl` / `searchUrlWithPatch` (URL building that
  preserves filters); `activeFilterChips` (removable chip models);
  `SEARCH_SORTS`, `SEARCH_PER_PAGE = 30`.

## Connections

- Reader: `app/(app)/search/page.tsx`. Writers: `search-form`,
  `search-sort-select`, `search-pagination`, `active-filters`
  (`components/search/`).
