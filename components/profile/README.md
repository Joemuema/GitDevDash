# `components/profile/` — Developer profile sections

Sections composing `/developers/[username]`: identity header, stats,
languages, featured repos carousel and activity analytics.

## Files

- `profile-header.tsx` — Avatar, name/login, bio, location/company/blog
  with tooltips; `DeveloperStatsBadges` for repos/followers/following;
  favorite `Toggle`, GitHub link and share `Tooltip` buttons.
- `developer-stats-badges.tsx` — Repos/followers/following as `Badge`s with
  explanatory `Tooltip`s.
- `language-overview.tsx` — Top-8 languages as a horizontal `Chart`
  (`BarChart`) with counts; doubles as the data source for the chart.
- `repository-list.tsx` / `repository-list-item.tsx` — Full repo list as
  `Item`/`ItemGroup` with language `Badge`s and a working `DropdownMenu`
  sort (recently updated, stars, name).
- `repos-carousel.tsx` — "Featured repositories": swipeable (`dragFree`)
  `Carousel` of the top-8 `sortReposForFeatured` repos (stars desc, ties by
  `updatedAt`), each a `bg-card/75` `Card` with star/fork badges.
- `dev-analytics.tsx` — "Recent activity" `Card`: pushes `BarChart` over an
  adaptive 1–14 day window plus totals (commits via Search API, pushes, PRs,
  issues). Seeded copy is replaced by `getUserActivitySummary`
  (`lib/github/activity.ts`).

## Connections

- Page: `app/(app)/developers/[username]/page.tsx`. Data: `lib/github/`.
