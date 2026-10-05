# `app/(app)/developers/[username]/` — Developer profile page

Route: `/developers/[username]`.

## Files

- `page.tsx` — Async server component. In parallel it fetches the user
  (`getUser`), their repos (`listUserRepos`, sorted featured-first via
  `sortReposForFeatured`), language stats (`getUserLanguageOverview`) and
  recent activity (`getUserActivitySummary`). Renders `ProfileHeader`
  (with `DeveloperStatsBadges`), `LanguageOverview`, `ReposCarousel` and
  `DevAnalytics`. A 404 from the API maps to `notFound()`; other API errors
  are re-thrown to the error boundary.

## Subfolders

- `repos/` — grouping segment for `[repo]/`, the repository detail page.
