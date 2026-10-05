# `app/api/` — Server-only route handlers

No UI here: `route.ts` files that speak HTTP (JSON, redirects). They run on
the server and can read secrets and cookies that client components cannot.

## Subfolders

- `auth/` — Authentication endpoints. See `auth/README.md`.
