# `app/(app)/hire/` — Hirer workspace (Steps 8–10)

Hirer-only subtree guarded by `requireRole("hirer")`. Base features stay
available here; job matching branches off from this workspace.

## Files

- `layout.tsx` — Guards the subtree: anon/role-less → `/welcome`, developers
  → `/grow`.
- `page.tsx` — Step 9 JD search + ranking: `?jd=<base64url>&devs=a,b&loc=…`
  drives `parseJdParam` → `assembleJdPool` (pasted logins first, JD-constrained
  GitHub search top-up, `searchDegraded` fallback) → untouched Step 4
  `batchMatchDevelopers` → `MatchShareActions` + `MatchShortlist`. Location
  override steers only the discovery leg. Step 10 adds endorsement counts +
  toggles, a side-by-side `CompareTable`, and the interview-handoff section
  (`ShortlistSaver` + `ShortlistsPanel`, backed by `getMyShortlists`).

## Connections

- Guard: `lib/auth/require-role.ts`. Pool: `lib/hire/jd-pool.ts`. Engine
  (reused, not forked): `lib/match/deep-scan.ts`, `lib/match/match-batch.ts`.
  Intake: `components/match/match-intake.tsx` (favorites one-click prefill).
  Search entry: `components/search/search-form.tsx` JD mode (hirers only).
