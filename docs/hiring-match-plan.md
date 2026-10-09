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
- [x] **Step 4 — `/match` batch shortlist.** JD intake, ranked results,
      compare table, human-decision disclaimer.
- [ ] **Step 5 — Tips panel.** `Item`-based tips grouped in tabs.
- [ ] **Step 6 — Saved JDs, share/export, gating.** Persist JDs, CSV export,
      auth hooks.

## Current step

**Step 4 DONE** (`/match` page + intake + ranked shortlist table + single-dev toggle links + sidebar nav). Next up: Step 5 (tips panel).
