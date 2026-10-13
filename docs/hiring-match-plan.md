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
- [x] **Step 10 — Merit + shortlists + compare.** `lib/hire/endorsements.ts`
      (one endorsement per account per login, aggregate counts public, toggles
      private) + `lib/hire/shortlists.ts` (named runs with interview notes,
      20-per-account cap) + hirer-only `lib/hire/actions.ts`; `EndorseButton`
      Merit column on the shortlist, transposed `CompareTable`, and the
      interview-handoff section (`ShortlistSaver` + `ShortlistsPanel`) on
      `/hire`.
- [x] **Step 11 — Demand + impressions.** `lib/grow/demand.ts` (anonymized
      per-JD language/framework counts, fed fire-and-forget from `/hire`) +
      `lib/grow/impressions.ts` (one view per hirer/dev/day, 90-day window,
      counts only); `/grow` renders `DemandRadar`, `ViewsPanel`, and
      `CoverageGaps` (own mix via `?gh=login`). Developer profiles record a
      hirer impression per visit.

- [x] **Step 12 — SEO + peers.** `lib/grow/seo.ts` (`scoreSeoProfile`: bio,
      location, repos, README/LICENSE, demand keywords) + `lib/grow/peers.ts`
      (`buildPeerCohort`: same top language, ±50% follower band, up to 6,
      `thin` < 3; `ownPeerStat`); `/grow` renders `SeoChecklist` and
      `PeerCompare` ("you vs median"), all failure-isolated with link-profile
      empty states.

- [x] **Step 13 — Tips re-homed.** `lib/grow/portfolio-tips.ts`
      (`scanGeneralTips`): JD-free scan reusing the Step 1 engine verbatim
      (empty signal → hygiene tips fire, JD tips no-op). `/grow` renders
      `TipsPanel` with general portfolio tips; the developer profile keeps
      JD-specific tips only.

- [x] **Step 14 — Pro flags + docs sweep.** `isPro` stub on the user store
      + session (always `false`, pre-role records coerce to free);
      client-safe `lib/billing/plans.ts` (`HIRER_PLAN` / `DEVELOPER_PLAN`
      copy + `canUsePro()`); `ProBadge` in Settings → Account, `PlanTable`
      on `/hire` and `/grow`; CSV/ATS export flipped from account-gated to
      Pro-gated with honest locked copy (share links stay free). No
      checkout, webhook, or upgrade path — billing is explicitly not live.

## Current step

**Steps 1-14 DONE.** Engine -> deep scan -> profile card ->
batch shortlist -> tips panel -> saved JDs/share/export/gating ->
docs sweep -> roles foundation -> hirer JD search + ranking ->
merit + shortlists + compare -> demand + impressions ->
SEO checklist + peer compare -> tips re-homed -> **Pro stub +
paywall copy + final docs sweep**.
Remaining, all deferred by decision: LLM JD-parser reminder, LLM
re-ranker seam, private-repo/resume signals, cross-device sync.
