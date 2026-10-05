# `app/(app)/settings/` — Settings page

Route: `/settings`. Client-rendered.

## Files

- `page.tsx` — Tabbed settings built from `components/ui/` primitives:
  `Tabs` (Appearance / Notifications / Data), `Checkbox`, `Field`,
  `Toggle`, `Switch`, `Badge`, `Card`, `Tooltip`, plus `LoginPopup` and a
  "Restart onboarding" action that clears the onboarding flag. Account
  management (name change, password change, sign out) is delegated to
  `AccountSettings` in `components/settings/`.

## Connections

- Auth state via `useAuth` (`hooks/use-auth.ts`); account mutations via
  server actions in `lib/auth/actions.ts`.
