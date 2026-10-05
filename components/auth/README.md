# `components/auth/` — Authentication UI

Client components for sign-in, session display and auth feedback. Session
truth lives server-side (`lib/auth/`); these components only render it.

## Files

- `auth-provider.tsx` — `AuthProvider` + `useAuthContext`. Receives the
  server-fetched user from `app/layout.tsx` and exposes it to the tree.
  Consumed via `hooks/use-auth.ts` (which adds a guard outside a provider).
- `login-popup.tsx` — Sign-in/register `Sheet` with email forms driven by
  `useActionState` + server actions (`lib/auth/actions.ts`), inline `Alert`
  feedback, and a "Continue with Google" button linking to
  `/api/auth/google`. Mounted in `SiteHeader` and the settings page.
- `account-menu.tsx` — Signed-in user menu (avatar, settings link, sign-out
  action) shown in `SiteHeader` when `useAuth()` returns a user.
- `auth-notice.tsx` — Banner reading `?auth=` / `?auth_error=` search params
  (OAuth success and failure codes from `lib/auth/messages.ts`).

## Connections

- Server logic: `lib/auth/actions.ts` (email flows), `app/api/auth/` (Google
  flow), `lib/auth/dal.ts` (current-user read). Header wiring in
  `components/layout/site-header.tsx`.
