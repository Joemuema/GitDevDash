/**
 * Plan copy and Pro gating helpers.
 *
 * This module is imported by both server and client code, so it must never
 * import `server-only` or touch the filesystem. The `isPro` flag itself lives
 * on `SessionUser` (always `false` until real billing lands — see
 * `lib/auth/user-store.ts`).
 *
 * The plan table below is the contract Step 14 promised: what is free today,
 * what will be Pro, and the honest one-liner for each. When billing arrives,
 * only the flag source changes — the copy stays.
 */

export type PlanTier = "free" | "pro"

export type PlanFeature = {
  /** Stable key for tests and future paywall checks. */
  id: string
  /** Short label shown in plan tables. */
  label: string
  /** Which tier unlocks it. */
  tier: PlanTier
  /** One honest sentence: what it does and why it costs. */
  blurb: string
}

export const HIRER_PLAN: PlanFeature[] = [
  {
    id: "jd-active",
    label: "1 active job description",
    tier: "free",
    blurb:
      "Paste one role, rank up to 5 candidates per run — enough to try the workflow end to end.",
  },
  {
    id: "jd-unlimited",
    label: "Unlimited JDs + named shortlists",
    tier: "pro",
    blurb:
      "Run every open role in parallel and keep each shortlist with interview notes.",
  },
  {
    id: "batch-25",
    label: "25-candidate batches",
    tier: "pro",
    blurb:
      "Larger pools cost more API calls per run, so bigger batches fund the quota.",
  },
  {
    id: "csv-export",
    label: "CSV / ATS export",
    tier: "pro",
    blurb: "One-click handoff of ranked results into your hiring pipeline.",
  },
  {
    id: "compare",
    label: "Side-by-side compare + scorecard",
    tier: "pro",
    blurb:
      "Line candidates up dimension by dimension and export the interview sheet.",
  },
  {
    id: "merit-weighted",
    label: "Merit-weighted ranking + alerts",
    tier: "pro",
    blurb:
      "Peer endorsements reshape the ranking, and new matching developers ping you.",
  },
]

export const DEVELOPER_PLAN: PlanFeature[] = [
  {
    id: "demand-top",
    label: "Demand radar + weekly views",
    tier: "free",
    blurb:
      "See which skills hirers search for and how often your profile surfaced this week.",
  },
  {
    id: "tips",
    label: "Repo tailoring tips",
    tier: "free",
    blurb:
      "Concrete file-level fixes stay free — they bring developers into the product.",
  },
  {
    id: "demand-history",
    label: "Demand history + keyword writer",
    tier: "pro",
    blurb:
      "Track what hirers wanted over time and get exact keywords for your bio and READMEs.",
  },
  {
    id: "views-daily",
    label: "Daily views + source breakdown",
    tier: "pro",
    blurb: "Know which job-description tags found you, day by day.",
  },
  {
    id: "cohorts",
    label: "Unlimited peer cohorts + tracking",
    tier: "pro",
    blurb: "Benchmark against more cohorts and watch your rank move over time.",
  },
  {
    id: "boost",
    label: "Profile boost in JD search",
    tier: "pro",
    blurb: "Rank higher when hirers search descriptions matching your stack.",
  },
]

/**
 * Whether the account unlocks a Pro-only feature. Today this is just the
 * `isPro` stub (always `false`), but every paywall check funnels through here
 * so billing only has to change the flag — never the call sites.
 */
export function canUsePro(
  user: { isPro?: boolean } | null | undefined
): boolean {
  return user?.isPro === true
}
