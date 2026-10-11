# `lib/auth/` — Authentication internals (server-only)

Accounts, password hashing, sessions and Google OAuth. Everything here runs
on the server (`server-only` guard): it touches the JSON user store
(`.data/users.json`, `AUTH_STORE_PATH` override), `scrypt` hashes and
`jose`-signed session cookies (`gdd_session`). Never import from client
components — go through server actions, the DAL or route handlers.

## Files

- `types.ts` / `messages.ts` / `form-state.ts` — User shapes (`SessionUser`
  carries `role: "hirer" | "developer" | null`), `auth_error`
  codes + copy, and `useActionState` form states.
- `roles.ts` — Client-safe role helpers (`roleHome`, `isRole`, `needsRolePick`).
  No `server-only` here: imported by Client Components.
- `require-role.ts` — Server-only `requireRole()` guard for `/hire/*` and
  `/grow/*` layouts: anon/role-less → `/welcome`, wrong role → own home.
- `password.ts` — `scrypt` hash/verify (N=16384, r=8, p=1).
- `user-store.ts` — File-backed store: register, verify, update name,
  change password (bumps `sessionVersion`), `findOrCreateGoogleUser`
  (links by verified email, never duplicates). `StoredUser.role` persists the
  interface choice (`null` for pre-role accounts, prompted once); `updateUser`
  accepts `role` + `roleUpdatedAt`.
- `session.ts` — `jose` HS256 create/read/destroy; `Secure` cookies in
  production; throws without a ≥32-char `SESSION_SECRET` in prod.
- `dal.ts` — `getCurrentUser()` data-access read used by layouts/pages.
- `google.ts` — OAuth URL builder, PKCE pair, code↔token exchange, profile
  fetch. Rejects unverified Google emails.
- `actions.ts` — Server actions: `signInWithEmail`, `registerAccount`,
  `updateDisplayName`, `changePassword`, `signOut`, `setRole`.

## Connections

- UI: `components/auth/` + `components/settings/`; entry points:
  `app/api/auth/` routes. `SESSION_SECRET`, `GOOGLE_*` documented in
  `.env.example`.
