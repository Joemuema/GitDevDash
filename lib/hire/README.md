# `lib/hire/` — Hirer-side workspace logic

Server-only helpers that power the `/hire` workspace. All GitHub API access
goes through the cached clients, so nothing here calls `fetch` directly.

`jd-pool.ts` → `assembleJdPool(signal, pastedLogins, max, locationOverride?)`:

1. Pasted logins first (cheapest — no API call). The hirer intake
   pre-fills these from browser-local favorites via `useFavorites`;
   favorites are invisible server-side, so no server round-trip is
   attempted for them.
2. Tops up from `GET /search/users` constrained by the JD (`type:user`
   - top required language + optional `location:` override + `repos:>=3`,
     sorted by followers, 2-minute cache).

The search leg is best-effort: rate-limit/network failure sets
`searchDegraded` instead of failing the pool, so explicitly chosen
candidates still score. Returned `sources` map records each login's
origin (`pasted` | `search`) in assembly order.

Downstream: the pool feeds the untouched Step 4
`batchMatchDevelopers` → `MatchShortlist` on `/hire`.

`endorsements.ts` → Step 10 merit store (`HireEndorsement`): one endorsement
per account per login, role tag + JD-language tags (no free text). Public
aggregates via `getEndorsementCounts` (no hirer identities); per-account
toggles via `getOwnEndorsements`. File-backed JSON at
`.data/hire-endorsements.json` (`AUTH_HIRE_ENDORSEMENTS_PATH` override),
atomic writes + mutex like the account store.

`shortlists.ts` → Step 10 named shortlists (`HireShortlist`): save the current
run (JD text + logins + interview notes) under a name, reload/rename/note/
delete later. Scoped by owning account id, 20-per-account cap. File-backed
JSON at `.data/hire-shortlists.json` (`AUTH_HIRE_SHORTLISTS_PATH` override).

`actions.ts` → hirer-only Server Actions (`requireRole("hirer")` on every
mutation): `toggleEndorsement`, `saveShortlist` (useActionState shape),
rename/notes/delete, `getMyShortlists` (returns `[]` for non-hirers).
