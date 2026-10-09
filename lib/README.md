# `lib/` — Framework-agnostic business logic

Pure TypeScript with no JSX: GitHub API clients, auth internals, URL
helpers, storage and formatting. Importable from server components, route
handlers and server actions alike.

## Subfolders

- `auth/` — Accounts, sessions, OAuth helpers and server actions.
- `github/` — GitHub REST clients (users, repos, tree, activity, languages).
- `search/` — Search-page URL param parsing/building.
- `favorites/` — Favorites localStorage key + parsing helpers.
- `match/` — Job-description matching engine (JD parser, stack fingerprints,
  heuristic scorer, developer rollup, tips). See `lib/match/README.md`.
- `types/` — Shared `GitHubUserSummary` / `GitHubRepoSummary` /
  `GitHubRepoDetail` / `LanguageStat` shapes.

## Files

- `routes.ts` — Typed route builders (`searchRoute`, `developerRoute`,
  `repositoryRoute`, `routes`).
- `utils.ts` — `cn()` class merger + `formatDate` (`date-fns`,
  `"MMM d, yyyy"`).
- `demo-data.ts` — Placeholder users/repos/languages used before API
  integration; still handy for offline component work.
