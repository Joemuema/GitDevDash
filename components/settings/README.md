# `components/settings/` — Account management sections

Forms backing the Data/Account area of `/settings`. Settings-page chrome
(tabs, toggles, switches) lives inline in the page; this folder holds the
stateful account logic.

## Files

- `account-settings.tsx` — Display-name form, password-change form (old
  password verification bumps `sessionVersion`, invalidating other
  sessions) and sign-out, all via server actions in
  `lib/auth/actions.ts` with inline `Alert` feedback. Reads/writes through
  `useAuth` (`hooks/use-auth.ts`).

## Connections

- Page: `app/(app)/settings/page.tsx`. Session truth: `lib/auth/`.
