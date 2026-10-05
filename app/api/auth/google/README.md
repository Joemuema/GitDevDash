# `app/api/auth/google/` — OAuth start endpoint

See `../README.md` for the full flow. This folder holds a single file:

## Files

- `route.ts` — `GET /api/auth/google`. Builds the Google authorization URL
  with `buildGoogleAuthUrl` (`lib/auth/google.ts`), sets short-lived
  `gdd_oauth_state` / `gdd_oauth_verifier` httpOnly cookies, and redirects
  (307) to `accounts.google.com`. Without `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` it redirects home with
  `?auth_error=not_configured`.
