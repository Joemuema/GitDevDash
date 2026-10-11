# `app/(app)/hire/` — Hirer workspace (Step 8 placeholder)

Hirer-only subtree guarded by `requireRole("hirer")`. Base features stay
available here; job matching branches off from this workspace.

## Files

- `layout.tsx` — Guards the subtree: anon/role-less → `/welcome`, developers
  → `/grow`.
- `page.tsx` — Dashboard cards for rank-against-JD, interview shortlist, and
  merit signals. Step 9 wires real JD search + ranking here; Step 10 adds
  endorsements, named shortlists, and compare.

## Connections

- Guard: `lib/auth/require-role.ts`. Engine (reused, not forked):
  `lib/match/deep-scan.ts`, `lib/match/match-batch.ts`.
