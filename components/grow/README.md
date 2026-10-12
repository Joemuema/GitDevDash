# `components/grow/` — Developer workspace presentation

Client-rendered charts and lists for `/grow` (Step 11). All data arrives as
props from the server page — no client fetching.

## Files

- `demand-radar.tsx` — Vertical `BarChart` of the top-10 demanded skills
  (languages + frameworks merged, count-sorted) with an across-N-searches
  footnote. Empty state explains the radar fills as hirers run matches.
- `views-panel.tsx` — 7-day view total + 30-day daily `BarChart` + top JD
  tags as `Badge`s. Empty state nudges profile sharing. Counts only — the
  summary type carries no identities by construction.
- `coverage-gaps.tsx` — Own language mix (via `?gh=login`, since accounts
  don't store a GitHub login yet) set against demand: covered count plus up
  to 6 missing-skill `Item`s with request counts. Unglinked state shows the
  `?gh=` hint; pre-demand state explains the wait.

## Connections

- Data: `lib/grow/demand.ts` + `lib/grow/impressions.ts` via
  `app/(app)/grow/page.tsx`. Charts follow the `LanguageOverview` /
  `DevAnalytics` `ChartContainer` pattern.
