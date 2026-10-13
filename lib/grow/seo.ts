import type { GitHubUserSummary } from "@/lib/types/github"

/**
 * Step 12 — profile SEO / discoverability checklist.
 *
 * Scores the public signals hirers actually filter on (bio, location, pinned
 * repos, README/LICENSE presence, keyword coverage vs demand) as pass/fail
 * checks with concrete fixes. Pure + testable: every input is passed in, so
 * no GitHub calls happen here.
 */

export type SeoCheck = {
  id: string
  label: string
  passed: boolean
  detail: string
  fix: string
}

export type SeoScoreInput = {
  user: GitHubUserSummary
  /** Top repo descriptions joined — keyword coverage is checked against these. */
  repoDescriptions: string[]
  hasReadme: boolean
  hasLicense: boolean
  /** Lower-cased demand vocabulary (languages + frameworks). */
  demandTerms: string[]
}

function hasValue(value: string | null): boolean {
  return value !== null && value.trim().length > 0
}

/** Counts how many demand terms appear in the bio + repo descriptions. */
function countKeywordHits(
  bio: string | null,
  descriptions: string[],
  demandTerms: string[]
): number {
  const haystack = [bio ?? "", ...descriptions].join("\n").toLowerCase()
  const hits = new Set<string>()
  for (const term of demandTerms) {
    const cleaned = term.trim().toLowerCase()
    if (!cleaned) continue
    // Word-boundary match so "go" doesn't hit "django".
    const pattern = new RegExp(
      `(^|[^a-z0-9+#])${escapeRegExp(cleaned)}([^a-z0-9+#]|$)`
    )
    if (pattern.test(haystack)) hits.add(cleaned)
  }
  return hits.size
}

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function scoreSeoProfile(input: SeoScoreInput): {
  checks: SeoCheck[]
  passed: number
  total: number
} {
  const { user, repoDescriptions, hasReadme, hasLicense, demandTerms } = input
  const keywordHits = countKeywordHits(user.bio, repoDescriptions, demandTerms)
  const keywordTarget = Math.min(3, demandTerms.length)

  const checks: SeoCheck[] = [
    {
      id: "bio",
      label: "Bio tells hirers what you do",
      passed: hasValue(user.bio),
      detail: user.bio?.trim() ?? "No bio set on the GitHub profile.",
      fix: "Add one line: role + top stack (e.g. “Backend engineer — Go, PostgreSQL, Kubernetes”).",
    },
    {
      id: "location",
      label: "Location is set",
      passed: hasValue(user.location),
      detail:
        user.location?.trim() ?? "No location — location filters skip you.",
      fix: "Set city + country so `location:` searches can find you.",
    },
    {
      id: "repos",
      label: "Enough public signal",
      passed: user.publicRepos >= 3,
      detail: `${user.publicRepos} public ${user.publicRepos === 1 ? "repo" : "repos"} — fewer than 3 makes scoring provisional.`,
      fix: "Ship or un-archive 1–2 small projects; pin your best work.",
    },
    {
      id: "readme",
      label: "Top repos have READMEs",
      passed: hasReadme,
      detail: hasReadme
        ? "README detected on a top repo."
        : "No README found on the sampled top repos.",
      fix: "Add a README with what it does, how to run it, and the stack.",
    },
    {
      id: "license",
      label: "Top repos are licensed",
      passed: hasLicense,
      detail: hasLicense
        ? "License detected on a top repo."
        : "No license found — companies deprioritize unlicensed code.",
      fix: "Add MIT (or your preferred) LICENSE to each flagship repo.",
    },
    {
      id: "keywords",
      label: "Demand keywords appear in bio + descriptions",
      passed: demandTerms.length === 0 || keywordHits >= keywordTarget,
      detail:
        demandTerms.length === 0
          ? "No demand data yet — check back after hirers run matches."
          : `${keywordHits} of ${keywordTarget}+ target keywords found (${demandTerms.slice(0, 5).join(", ")}…).`,
      fix: "Mirror the exact demand terms (TypeScript, Docker…) in your bio and repo descriptions.",
    },
  ]

  return {
    checks,
    passed: checks.filter((c) => c.passed).length,
    total: checks.length,
  }
}
