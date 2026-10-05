# `lib/github/` — GitHub REST API clients (server-only)

Thin, cache-aware wrappers around the public GitHub API. Auth via
`GITHUB_TOKEN` (`.env.local`): 5,000 req/hr authenticated vs 60
unauthenticated. Responses are mapped from snake_case to the camelCase
shapes in `lib/types/github.ts`.

## Files

- `client.ts` — `githubFetch`: Bearer header, rate-limit parsing, Next.js
  fetch caching, `GitHubApiError` on failure (`errors.ts`).
- `users.ts` — `searchUsers` (search API + per-user `getUser` enrichment so
  cards show real repos/followers/following; 1h cache), `getUser`,
  `getUsers`.
- `repos.ts` — `listUserRepos`, `getRepository` (1h cache),
  `sortReposForFeatured` (stars desc, ties by `updatedAt`).
- `tree.ts` — `getRepoTree`: recursive git-trees API → nested
  folders-first tree, 2000-entry cap with truncation flag.
- `activity.ts` — `getUserActivitySummary`: public events (adaptive 1–14
  day window) + exact commit count via the commits Search API (separate
  30 req/min bucket; degrades to `null`).
- `languages.ts` — Per-repo and aggregated user language stats.
- `mappers.ts` — `mapUser` / `mapRepo` / `mapRepoDetail` /
  `mapLanguageStats` with safe defaults.
- `actions.ts` — `refreshFavoriteUsers` server action for the favorites
  page.

## Connections

- Consumed by `app/(app)/` pages and `app/api/`. Commits Search has its
  own rate-limit bucket, so analytics can't starve the core quota.
