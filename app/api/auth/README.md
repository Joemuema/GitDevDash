# `app/api/auth/` — Authentication route handlers

Server endpoints for the Google OAuth 2.0 + PKCE flow. Email/password auth
uses server actions (`lib/auth/actions.ts`) instead, so it needs no routes.

## Subfolders

- `google/` → `GET /api/auth/google` — starts the flow: generates a PKCE
  verifier/challenge pair and a CSRF `state` token, stores both in
  httpOnly cookies, and redirects to Google's consent screen.
  Returns `auth_error=not_configured` when Google credentials are absent.
- `google/callback/` → `GET /api/auth/google/callback` — validates `state`
  and the verifier cookie, exchanges the `code` for tokens, fetches the
  Google profile, links-or-creates the user via `findOrCreateGoogleUser`,
  creates the `gdd_session` cookie, and redirects home with
  `?auth=google`. Failures redirect with an `auth_error` code rendered by
  `AuthNotice` (`components/auth/`).
