# GitDevDash

Explore GitHub developers and repositories: search, open a profile or a single
repo, compare languages and recent activity, and save the developers you care
about.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and
shadcn-style components on top of Base UI.

## Requirements

- Node.js 20 or newer
- npm

## Quick start

```bash
npm install
copy .env.example .env.local   # macOS/Linux: cp .env.example .env.local
# edit .env.local - see Environment variables below
npm run dev
```

Then open http://localhost:3000.

## Environment variables

`.env.example` is only a template - Next.js reads `.env.local` (and `.env`) at
runtime. Every variable is optional for local development, but each unlocks
something.

| Variable | Needed for | Notes |
| --- | --- | --- |
| `GITHUB_TOKEN` | Recommended | Authenticates GitHub API calls and raises the limit from 60 to 5,000 requests/hour. Create one at https://github.com/settings/tokens - no scopes are required for public data. Without it, pages that fetch many resources (repo trees, search enrichment) can hit the limit. |
| `SESSION_SECRET` | Production | Signs and encrypts the `gdd_session` cookie. At least 32 characters. In development an insecure fallback is used and a warning is logged. Generate one with `node -e "console.log(require(''crypto'').randomBytes(32).toString(''base64url''))"`. |
| `GOOGLE_CLIENT_ID` | Optional | Enables "Continue with Google". |
| `GOOGLE_CLIENT_SECRET` | Optional | Enables "Continue with Google". |
| `GOOGLE_REDIRECT_URI` | Optional | The exact redirect URI registered with Google. Defaults to `<origin>/api/auth/google/callback`. |
| `AUTH_STORE_PATH` | Optional | File used for account records. Defaults to `./.data/users.json`. |

## Accounts and sign-in

- Email/password accounts are stored as JSON at `.data/users.json` (gitignored;
  delete the file to reset). Passwords are hashed with `scrypt`.
- Sessions are stateless, encrypted JWTs (`dir` + `A256GCM`) in an `httpOnly`
  cookie, so nothing sensitive is readable or forgeable from the browser.
- Changing a password increments `sessionVersion`, which invalidates every
  existing session for that account.

### Enabling "Continue with Google"

The button fails safely: with no credentials configured, `/api/auth/google`
redirects back with `?auth_error=not_configured` and the reason is shown.

1. Open https://console.cloud.google.com/apis/credentials
2. Create a project if prompted, then **Create credentials -> OAuth client ID**.
3. Configure the consent screen if asked (User type *External*, then add
   yourself as a *Test user* while the app is unpublished).
4. Application type: **Web application**.
5. Under **Authorised redirect URIs** add exactly:

   ```
   http://localhost:3000/api/auth/google/callback
   ```

6. Copy the **Client ID** and **Client secret** into `.env.local`:

   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

7. Restart `npm run dev` and click **Continue with Google**.

The flow is the authorization-code flow with **PKCE** plus a CSRF `state`
cookie. The redirect URI must match what is registered **exactly**, including
the scheme, host, port and path - otherwise Google returns
`redirect_uri_mismatch`. If `npm run dev` picks a different port, update both
sides.

Callback results are reported as `?auth_error=<code>` and rendered by
`components/auth/auth-notice.tsx`:

| Code | Meaning |
| --- | --- |
| `not_configured` | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not set. |
| `cancelled` | The user closed or declined the consent screen. |
| `invalid_state` | Missing or expired CSRF state / PKCE verifier, or a state mismatch. |
| `exchange_failed` | Google rejected the code exchange (wrong secret, redirect mismatch, clock skew). The reason is logged server-side. |
| `profile_failed` | The Google address is not verified, or the profile could not be read. |

Signing in with Google using an address that already has a password account
links the two rather than creating a duplicate: the account id is preserved,
the password still works, and Google's name and avatar are adopted if present.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier over `**/*.{ts,tsx}` |

In production the session cookie is set with `Secure`, so the app must be served
over HTTPS.

## Project layout

```
app/
  (app)/               session-aware shell: home, search, developers, favorites, settings
  api/auth/google/     OAuth entry point + callback
  layout.tsx           providers (theme, auth, favorites)
components/
  auth/                sign-in sheet, account menu, provider, notices
  favorites/           favorites provider, list, toolbar, header
  layout/              app shell, sidebar, header, footer, containers
  onboarding/          first-visit questionnaire
  profile/             developer header, stats, analytics, repo carousel
  repo/                repo header, file explorer, language breakdown
  search/              search form, results, filters, pagination
  settings/            account settings panel
  ui/                  Base UI primitives
lib/
  auth/                sessions, user store, password hashing, Google OAuth
  github/              API client, mappers, users, repos, languages, tree
  favorites/           localStorage persistence
  search/              URL param parsing and query building
```

## Data sources

All GitHub data comes from the public REST API. Repository file trees use the
Git Trees endpoint, and recent activity uses the public events feed plus the
commits search endpoint. Both degrade to a clear empty state when a user has no
public activity or a request fails.