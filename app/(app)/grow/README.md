# `app/(app)/grow/` — Developer workspace (Step 8 placeholder)

Developer-only subtree guarded by `requireRole("developer")`. Base features
stay available here; visibility and repo tailoring branch off from this
workspace.

## Files

- `layout.tsx` — Guards the subtree: anon/role-less → `/welcome`, hirers →
  `/hire`.
- `page.tsx` — Dashboard cards for demand radar, view counts, and repo tips.
  Step 11 wires demand + impressions here; Step 12 adds SEO checklist and
  peer compare; Step 13 re-homes `TipsPanel` here.

## Connections

- Guard: `lib/auth/require-role.ts`. Tips source (reused, not forked):
  `lib/match/tips.ts`.
