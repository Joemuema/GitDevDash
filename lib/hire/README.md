# `lib/hire/` — Hirer-side JD candidate pool (Step 9)

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
