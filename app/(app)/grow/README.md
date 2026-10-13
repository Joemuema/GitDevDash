# `app/(app)/grow/` — Developer workspace (Steps 8, 11, 12, 13)

Developer-only subtree guarded by `requireRole("developer")`. Base features
stay available here; visibility and repo tailoring branch off from this
workspace.

## Files

- `layout.tsx` — Guards the subtree: anon/role-less → `/welcome`, hirers →
  `/hire`.
- `page.tsx` — Step 11 demand radar + view counts + coverage, Step 12 SEO
  checklist + peer compare, Step 13 portfolio tips: `?gh=login` optionally
  links the GitHub profile (accounts don't store one yet). Helpers
  `buildSeoInput` (user + top-3 non-fork descriptions + README/LICENSE from
  tree fingerprints), `buildPeers` (cohort + own row), and `scanGeneralTips`
  (JD-free hygiene scan) run alongside the demand/languages/views fetches,
  all failure-isolated. Renders `DemandRadar`, `ViewsPanel`, `CoverageGaps`,
  `SeoChecklist`, `PeerCompare`, and `TipsPanel` (general tips — no JD).

## Connections

- Guard: `lib/auth/require-role.ts`. Data: `lib/grow/demand.ts`,
  `lib/grow/impressions.ts`, `lib/grow/seo.ts`, `lib/grow/peers.ts` (+
  `lib/match/stack.ts` fingerprints, `lib/github/` sources). Presentation:
  `components/grow/`.
  Tips source (reused, not forked): `lib/match/tips.ts`.
