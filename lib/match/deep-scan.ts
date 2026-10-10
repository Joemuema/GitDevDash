import "server-only"
import { getUserActivity } from "@/lib/github/activity"
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
import type {
  DevActivity,
  GitHubRepoSummary,
  LanguageStat,
} from "@/lib/types/github"
import {
  scoreDeveloper,
  scoreRepo,
  type DeveloperMatch,
  type JobSignal,
  type RepoScoringInput,
} from "@/lib/match/rollup"

/*
 * Step 2 — deep-scan wiring. Fetches the live GitHub data a single developer
 * match needs and feeds it into the Step 1 engine.
 *
 * API budget per developer (cached clients, all failures degrade to empty):
 * - 1 listUserRepos + 1 getUserActivity (events + commits search) +
 *   1 getUserLanguageOverview (internally: 1 list + up to 25 language fetches,
 *   shared with the profile page cache) +
 *   per deep-scanned repo: 1 detail + 1 languages + 1 tree.
 * The DEFAULT_DEEP_SCAN_LIMIT of 8 repos caps the worst case at ~27 calls.
 */

export const DEFAULT_DEEP_SCAN_LIMIT = 8

export type DeepScanStats = {
  /** Non-fork repos considered, before the deep-scan cap. */
  candidateRepos: number
  /** Repos actually deep-scanned (languages + tree fetched). */
  scannedRepos: number
  /** Full names skipped because their tree or detail fetch failed. */
  skippedRepos: string[]
  /** True when the activity lookup failed and scored as zero. */
  activityUnavailable: boolean
}

export type DeepScanResult = {
  match: DeveloperMatch
  languages: LanguageStat[]
  sampledRepoCount: number
  activity: DevActivity | null
  stats: DeepScanStats
}

type ScanCandidate = {
  repo: GitHubRepoSummary
  input: RepoScoringInput
}

/*
 * Detail first (for the default branch), then languages + tree in parallel —
 * same two-phase shape as the repo page's `fetchRepoPageData`. Any failure
 * degrades that repo out of the match instead of failing the whole scan.
 */
async function buildCandidate(
  username: string,
  repo: GitHubRepoSummary
): Promise<ScanCandidate | null> {
  try {
    const detail = await getRepository(username, repo.name)
    const [languages, tree] = await Promise.all([
      getRepoLanguageStats(username, repo.name).catch(() => []),
      getRepoTree(username, repo.name, detail.defaultBranch)
        .then((result) => result.files)
        .catch(() => []),
    ])
    return { repo: detail, input: { repo: detail, languages, tree } }
  } catch {
    return null
  }
}

export async function deepScanDeveloper(
  username: string,
  signal: JobSignal,
  limit = DEFAULT_DEEP_SCAN_LIMIT
): Promise<DeepScanResult> {
  const [repos, langOverview, activity] = await Promise.all([
    listUserRepos(username, "updated").catch(() => []),
    getUserLanguageOverview(username).catch(() => ({
      languages: [],
      sampledRepoCount: 0,
    })),
    getUserActivity(username).catch(() => null),
  ])

  const ownRepos = repos.filter((r) => !r.fork)
  const shortlist = sortReposForFeatured(ownRepos).slice(0, Math.max(0, limit))

  const built = await Promise.all(
    shortlist.map((repo) => buildCandidate(username, repo))
  )

  const scanned: ScanCandidate[] = []
  const skippedRepos: string[] = []
  for (let i = 0; i < shortlist.length; i += 1) {
    const candidate = built[i]
    if (candidate) scanned.push(candidate)
    else skippedRepos.push(shortlist[i].fullName)
  }

  const repoMatches = scanned.map(({ input }) => scoreRepo(input, signal))

  return {
    match: scoreDeveloper(
      {
        login: username,
        languages: langOverview.languages,
        sampledRepoCount: langOverview.sampledRepoCount,
        activity,
        repoMatches,
      },
      signal
    ),
    languages: langOverview.languages,
    sampledRepoCount: langOverview.sampledRepoCount,
    activity,
    stats: {
      candidateRepos: ownRepos.length,
      scannedRepos: scanned.length,
      skippedRepos,
      activityUnavailable: activity === null,
    },
  }
}
