# `lib/types/` — Shared GitHub data shapes

Single file of camelCase domain types produced by `lib/github/mappers.ts`
and consumed by pages and components.

## Files

- `github.ts` — `GitHubUserSummary` (login, name, bio, location, company,
  repos/followers/following counts…), `GitHubRepoSummary` /
  `GitHubRepoDetail` (stars, forks, language, license, branch, topics…),
  `LanguageStat`, plus the repo file-tree node types used by
  `FileExplorer`.
