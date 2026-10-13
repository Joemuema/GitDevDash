/**

- Billing: plan copy and Pro gating helpers.
-
- Client-safe by design (no `server-only`, no filesystem) so both server
- pages and client components can import it. The `isPro` flag itself lives
- on `SessionUser` and is always `false` until real billing lands.
-
- Free vs Pro contract:
- - Hirers: the score itself stays free. Scale (JDs, batch size), evidence
- depth (compare), and handoff artifacts (CSV/ATS export) are Pro.
- - Developers: demand radar, tips, and weekly views are free. History,
- keyword writing, unlimited cohorts, and search boost are Pro.
-
- Files:
- - `plans.ts` — `HIRER_PLAN` / `DEVELOPER_PLAN` copy tables + `canUsePro()`.
- When billing arrives, only the flag source changes, never the call sites.
  */
