# `app/(app)/welcome/` — Interface picker entry point

Role selection for signed-in users without a stored role, plus sign-in
guidance for anonymous visitors.

## Files

- `page.tsx` — Server component. Users with a role redirect to their home
  (`/hire` or `/grow`, or `?next=` when present). Users without a role get
  `RolePicker`; anonymous visitors get explainer copy with a
  `?next=` return path preserved through sign-in.

## Connections

- Picker UI: `components/onboarding/role-picker.tsx`. Role helpers:
  `lib/auth/roles.ts` (`roleHome`). Deep-link target of `requireRole()`
  redirects from `/hire/*` and `/grow/*` layouts.
