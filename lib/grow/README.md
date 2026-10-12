# `lib/grow/` — Developer-side workspace logic

Server-only helpers that power the `/grow` workspace. Everything here is
anonymized aggregates — no hirer identities, no JD text, ever.

## Files

- `demand.ts` — Step 11 demand radar store: per-JD language/framework counts
  (`.data/grow-demand.json`, `AUTH_GROW_DEMAND_PATH` override). `recordDemand`
  bumps each distinct tag once per JD (keyword-stuffed descriptions can't
  skew it); `getDemandSnapshot` returns the top-N lists + JD total. Fed
  fire-and-forget from `/hire` — results never wait on it.
- `impressions.ts` — Step 11 "who viewed you" store
  (`.data/grow-impressions.json`, `AUTH_GROW_IMPRESSIONS_PATH` override).
  `recordImpression` dedupes on viewer + login + UTC date (one view per
  hirer/dev/day — refreshes can't inflate it), keeps 90 days per login.
  `getImpressionSummary` returns trailing-30-day daily buckets + 7-day total
  - top JD tags. Viewer ids are dedupe keys only, never surfaced.

Both stores use atomic temp-file writes + a promise-chain mutex (the pattern
from the account and hire stores) and are git-ignored.

## Connections

- Writers: `/hire` records demand per run; the developer profile page records
  an impression per signed-in hirer visit (fire-and-forget, hirer role only).
- Readers: `/grow` renders `DemandRadar`, `ViewsPanel`, `CoverageGaps`.
