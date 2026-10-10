# `lib/match/` — Job-description matching engine (heuristic v1)

Pure TypeScript, no JSX, no network calls. Takes GitHub data fetched by
`lib/github/` plus a parsed job description, and returns explainable
candidate scores with evidence pointers and repo-tailoring tips.

## Status

**Steps 1–6 of the hiring-match plan — DONE.** Engine (Step 1), deep scan
(Step 2), profile card (Step 3), batch shortlist (Step 4), tips panel
(Step 5), saved JDs + share/export + gating (Step 6). Remaining: LLM
re-ranker seam, private-repo/resume signals, cross-device sync.

## Files

- `types.ts` — `JobSignal`, `DimensionScore`, `RepoMatch`, `DeveloperMatch`,
  `DeveloperTip`, `StackEvidence`, `DIMENSION_WEIGHTS` (30/25/20/15/10),
  `SCORER_VERSION` (`"heuristic-v1"`).
- `jd.ts` — `parseJobDescription(text)`: deterministic keyword parser with
  explicit language/framework vocabularies, `nice-to-have` sentence detection,
  shorthand aliases (`ts` → `typescript`, `k8s` → `kubernetes`) and seniority
  detection. No ML dependency.
- `stack.ts` — `fingerprintRepoTree(tree)`: detects frameworks/tools from
  config and manifest **filenames only** (no blob fetches), plus README,
  LICENSE, CI, tests and Dockerfile flags. Same vocabulary as the JD parser.
- `scoring.ts` — `scoreRepoHeuristic` (4 repo dims), `scoreDeveloper` (5 dims
  - confidence + tips). `scoreRepo` is the seam: wrap or replace it to add an
    LLM re-ranker without changing callers. Quality blends star traction
    (log-scaled), update recency, hygiene and issue load; activity is
    developer-level only because GitHub exposes no per-repo activity endpoint.
- `tips.ts` — `buildTips`: gap analysis producing `quick-win` /
  `portfolio-gap` / `for-this-jd` tips that reference concrete repos.
- `jd-param.ts` — Shareable `?jd=` codec: `encodeJdParam` / `decodeJdParam`
  (base64url, 4000-char cap) plus `parseJdParam` returning `{ text, signal }`.
- `deep-scan.ts` — `deepScanDeveloper(username, signal, limit?)`: Step 2
  wiring. Fetches `listUserRepos` + language overview + activity once, then
  deep-scans up to `DEFAULT_DEEP_SCAN_LIMIT` (8) non-fork repos
  (star-sorted via `sortReposForFeatured`): detail first for the default
  branch, then languages + tree in parallel. Per-repo failures degrade that
  repo out; returns `DeepScanResult` (`DeveloperMatch` + languages +
  activity + `DeepScanStats`). All reads go through the cached clients.
- `saved-jds.ts` — Browser-local saved-JD store (same
  `useSyncExternalStore` external-store pattern as favorites).
- `export-csv.ts` — Pure `batchResultToCsv` flattener for ATS handoff.
- `index.ts` — Barrel exports.

## How it connects

```

```

JD text --parseJobDescription--> JobSignal --+
+-- scoreRepo --> RepoMatch
repos/languages/trees (lib/github) ----------+
+-- scoreDeveloper --> DeveloperMatch (+ tips)

```

Callers (Step 3+) fetch data with the existing cached clients, then call
`scoreRepo` per repo (cap: top 8, "deep scan" default) and `scoreDeveloper`
once. Every score carries `evidence` so UI can show _why_.
```
