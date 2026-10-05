# `app/api/auth/google/callback/` — OAuth callback endpoint

See `../../README.md` for the full flow. This folder holds a single file:

## Files

- `route.ts` — `GET /api/auth/google/callback`. Rejects user-denied
  (`error=access_denied` → `cancelled`), mismatched `state` or missing
  verifier (`invalid_state`), then calls `exchangeCodeForTokens`,
  `fetchGoogleProfile` and `findOrCreateGoogleUser` (`lib/auth/`).
  Unverified Google emails are rejected (`profile_failed`). On success it
  creates the session cookie and redirects to `/?auth=google`; exchange or
  config failures map to `exchange_failed` / `not_configured`.
