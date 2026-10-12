# `app/(app)/grow/` — Developer workspace (Steps 8, 11)

Developer-only subtree guarded by `requireRole("developer")`. Base features
stay available here; visibility and repo tailoring branch off from this
workspace.

## Files

- `layout.tsx` — Guards the subtree: anon/role-less → `/welcome`, hirers →
  `/hire`.
- `page.tsx` — Step 11 demand radar + view counts + coverage: `?gh=login`
  optionally links the GitHub profile (accounts don't store one yet);
  `getDemandSnapshot` + own `getUserLanguageOverview` + `getImpressionSummary`
  render `DemandRadar`, `ViewsPanel`, `CoverageGaps`. Step 12 adds SEO
  checklist and peer compare; Step 13 re-homes `TipsPanel` here.

## Connections

- Guard: `lib/auth/require-role.ts`. Data: `lib/grow/demand.ts`,
  `lib/grow/impressions.ts`. Presentation: `components/grow/`.
  Tips source (reused, not forked): `lib/match/tips.ts`.
