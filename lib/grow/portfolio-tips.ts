import "server-only"

import type {
  DevActivity,
  GitHubRepoSummary,
  LanguageStat,
} from "@/lib/types/github"
import { scoreDeveloper, type DeveloperMatch } from "@/lib/match/rollup"
import { scoreRepoHeuristic } from "@/lib/match/rollup"
import {
  getRepoLanguageStats,
  getUserLanguageOverview,
} from "@/lib/github/languages"
import {
  getRepository,
  listUserRepos,
  sortReposForFeatured,
} from "@/lib/github/repos"
import { getRepoTree } from "@/lib/github/tree"
import { getUserActivity } from "@/lib/github/activity"
import type { JobSignal } from "@/lib/match/types"

/**
 * Step 13 — general portfolio tips for `/grow`: a JD-free scan that reuses the
 * Step 1 engine verbatim. An empty signal makes the language/stack/relevance
 * tips no-op (their guards require `requiredLanguages.length > 0`), while the
 * universal hygiene tips (README, license, stale flagship, activity,
 * thin portfolio) still fire. No fork of the scoring logic.
 */

const EMPTY_SIGNAL: JobSignal = {
  title: null,
  requiredLanguages: [],
  niceToHaveLanguages: [],
  requiredFrameworks: [],
  niceToHaveFrameworks: [],
  keywords: [],
  seniority: "any",
  rawText: "",
}

export type GeneralTipsResult = {
  match: DeveloperMatch
  languages: LanguageStat[]
  sampledRepoCount: number
  activity: DevActivity | null
}

/**
 * Mirrors `deepScanDeveloper`'s two-phase shape (detail for the branch, then
 * languages + tree in parallel) but scores repo quality directly instead of
 * JD fit: quality dimensions don't depend on the signal, so they rank
 * portfolio health on their own.
 */
export async function scanGeneralTips(
  username: string,
  limit = 8
): Promise<GeneralTipsResult> {
  const [repos, langOverview, activity] = await Promise.all([
    listUserRepos(username, "updated").catch(() => []),
    getUserLanguageOverview(username).catch(() => ({
      languages: [],
      sampledRepoCount: 0,
    })),
    getUserActivity(username).catch(() => null),
  ])

  const shortlist = sortReposForFeatured(repos.filter((r) => !r.fork)).slice(
    0,
    Math.max(0, limit)
  )

  const built = await Promise.all(
    shortlist.map(async (repo: GitHubRepoSummary) => {
      try {
        const detail = await getRepository(username, repo.name)
        const [languages, tree] = await Promise.all([
          getRepoLanguageStats(username, repo.name).catch(() => []),
          getRepoTree(username, repo.name, detail.defaultBranch)
            .then((result) => result.files)
            .catch(() => []),
        ])
        const repoMatch = scoreRepoHeuristic(
          { repo: detail, languages, tree },
          EMPTY_SIGNAL
        )
        return { repo: detail, quality: repoMatch }
      } catch {
        return null
      }
    })
  )
  const repoMatches = built
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .map((b) => b.quality)

  const match = scoreDeveloper(
    {
      login: username,
      languages: langOverview.languages,
      sampledRepoCount: langOverview.sampledRepoCount,
      activity,
      repoMatches,
    },
    EMPTY_SIGNAL
  )

  return {
    match,
    languages: langOverview.languages,
    sampledRepoCount: langOverview.sampledRepoCount,
    activity,
  }
}
