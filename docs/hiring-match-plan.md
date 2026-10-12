# Hiring-match plan — build tracker

Batch-first matching with a single-developer toggle. Human interviewers keep
the final decision — the UI must carry that disclaimer wherever a score can
drive a hiring choice.

Decisions: batch shortlist by default + single-dev toggle (with disclaimer);
heuristic v1 now, LLM re-ranker later (**reminder: start the LLM-assisted JD
parser once the heuristic works well**); public data now, private-repo and
resume-upload signals later.

## Steps

- [x] **Step 1 — Matching engine (`lib/match/`).** Types, JD parser,
      tree-based stack fingerprints, heuristic `scoreRepo` (+ `RepoScorer` seam),
      developer rollup with confidence, tips generator. Pure + documented.
- [x] **Step 2 — Deep-scan wiring.** `deepScanDeveloper` in
      `lib/match/deep-scan.ts`: one repo list + language overview + activity
      fetch, then per-repo detail → languages + tree in parallel for up to 8
      star-sorted non-forks. Cached clients, per-repo failures degrade into
      `skippedRepos`, stats returned alongside the match.
- [x] **Step 3 — Profile match card.** `JdInput` + `MatchCard` on the
      developer page behind a shareable `?jd=` param; meter + anatomy bars +
      confidence + human-decision disclaimer. Doubles as the Step 4 toggle target.
- [x] **Step 4 — Batch shortlist (now `/hire`).** JD intake, ranked
      results, compare table, human-decision disclaimer. Step 9 re-homed it
      under the hirer workspace; legacy `/match` redirects to `/hire`
      preserving query params.
- [x] **Step 5 — Tips panel.** `TipsPanel` (`Item` + `Tabs` + `Badge`)
      on the Step 3 developer view and for the top-ranked batch candidate.
- [x] **Step 6 — Saved JDs, share/export, gating.** `SavedJdsProvider` +
      `SavedJdsPanel` (browser-local saved roles), `MatchShareActions` (free
      copy-link + account-gated CSV via `batchResultToCsv`), anonymous share
      preserved.
- [x] **Step 7 — Docs sweep + verification.** READMEs, full gates green.
- [x] **Step 8 — Roles foundation.** `role` on the user store + session,
      `setRole` action, `requireRole`/`<RoleGate>`, role picker at `/welcome`,
      guarded `/hire` + `/grow` subtrees, role-aware sidebar, Settings
      interface switcher.
- [x] **Step 9 — Hirer JD search + ranking.** `SearchForm` Developers/JD mode
      toggle (hirers only) pushing `?jd=&devs=&loc=` to `/hire`;
      `lib/hire/jd-pool.ts` assembles pasted logins first, tops up from a
      JD-constrained GitHub search (`searchDegraded` fallback); the untouched
      Step 4 `batchMatchDevelopers` scores into `MatchShortlist`. Favorites
      merge client-side via intake prefill.

## Current step

**Steps 1-9 DONE.** Engine -> deep scan -> profile card ->
batch shortlist -> tips panel -> saved JDs/share/export/gating ->
docs sweep -> roles foundation -> **hirer JD search + ranking** (SearchForm JD mode,
assembleJdPool, searchDegraded fallback, favorites prefill).
Remaining, all deferred by decision: LLM JD-parser reminder, LLM
re-ranker seam, private-repo/resume signals, cross-device sync.
