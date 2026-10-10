# `app/(app)/match/` — Batch hiring shortlist (Step 4)

`page.tsx` is a server component. `?jd=<base64url>&devs=a,b,c` drives
everything: `parseJdParam` + `parseBatchMatchParams` decode, then
`batchMatchDevelopers` scores up to `MAX_MATCH_CANDIDATES` (5) candidates.
Per-candidate failures degrade into `failedLogins`; extras into
`trimmedLogins`. Each row links to the single-developer view via
`routes.developerMatch(login, jdEncoded)` — the Step 3 page with the JD
pre-filled, carrying the human-decision disclaimer.

Step 6 additions: `MatchShareActions` (copy-link + account-gated CSV) above
the results, and `SavedJdsPanel` (browser-local saved roles) under the
intake. Share links keep working for anonymous visitors; CSV export and
cross-device sync need an account.

Shareable URL: the whole shortlist (JD + logins) round-trips through the
query string, so hiring teams can paste a link into an ATS or chat.
