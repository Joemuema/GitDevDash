import { githubFetch } from "@/lib/github/client"
import { getUserActivity } from "@/lib/github/activity"
import { getUser } from "@/lib/github/users"
import { listUserRepos, sortReposForFeatured } from "@/lib/github/repos"
import type { GitHubUserSummary } from "@/lib/types/github"

/**
 * Step 12 — peer cohort compare ("you vs median").
 *
 * Builds a cohort via GitHub user search: same top language, follower band
 * around the developer (±50%, min 5). Compares public, privacy-safe signals
 * only — followers, public repos, stars on top repos, recent activity. Never
 * another developer's private data; cohort members are named (they're public
 * profiles) but only aggregate medians are emphasised.
 */

export type PeerStat = {
  login: string
  followers: number
  publicRepos: number
  topRepoStars: number
  pushes: number
}

export type PeerCohort = {
  members: PeerStat[]
  medians: {
    followers: number
    publicRepos: number
    topRepoStars: number
    pushes: number
  }
  /** True when the cohort is too thin to trust (fewer than 3 peers). */
  thin: boolean
}

type CohortSearchResponse = {
  items: Array<{ login: string }>
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

async function peerStat(login: string): Promise<PeerStat | null> {
  try {
    const [user, repos, activity] = await Promise.all([
      getUser(login),
      listUserRepos(login, "updated").catch(() => []),
      getUserActivity(login).catch(() => null),
    ])
    const top = sortReposForFeatured(repos.filter((r) => !r.fork))[0]
    return {
      login: user.login,
      followers: user.followers,
      publicRepos: user.publicRepos,
      topRepoStars: top?.stargazersCount ?? 0,
      pushes: activity?.pushes ?? 0,
    }
  } catch {
    return null
  }
}

/**
 * Finds up to 6 peers: same top language, followers within ±50% (min band
 * of 5 either side), excluding the developer themselves.
 */
export async function buildPeerCohort(
  user: GitHubUserSummary,
  topLanguage: string | null
): Promise<PeerCohort> {
  const empty: PeerCohort = {
    members: [],
    medians: { followers: 0, publicRepos: 0, topRepoStars: 0, pushes: 0 },
    thin: true,
  }

  const low = Math.max(0, Math.floor(user.followers * 0.5))
  const high = Math.max(user.followers + 5, Math.ceil(user.followers * 1.5))
  const parts = ["type:user", `followers:${low}..${high}`]
  if (topLanguage) parts.push(`language:${topLanguage}`)

  let logins: string[] = []
  try {
    const sp = new URLSearchParams({
      q: parts.join(" "),
      per_page: "12",
      page: "1",
      sort: "followers",
      order: "desc",
    })
    const data = await githubFetch<CohortSearchResponse>(
      `/search/users?${sp.toString()}`,
      { revalidate: 600 }
    )
    logins = data.items
      .map((i) => i.login)
      .filter((l) => l.toLowerCase() !== user.login.toLowerCase())
      .slice(0, 8)
  } catch {
    return empty
  }

  const stats = (
    await Promise.all(logins.map((login) => peerStat(login)))
  ).filter((s): s is PeerStat => s !== null)

  const members = stats.slice(0, 6)
  return {
    members,
    medians: {
      followers: median(members.map((m) => m.followers)),
      publicRepos: median(members.map((m) => m.publicRepos)),
      topRepoStars: median(members.map((m) => m.topRepoStars)),
      pushes: median(members.map((m) => m.pushes)),
    },
    thin: members.length < 3,
  }
}

/** The developer's own stat row, shaped like a peer for the compare table. */
export async function ownPeerStat(user: GitHubUserSummary): Promise<PeerStat> {
  const [repos, activity] = await Promise.all([
    listUserRepos(user.login, "updated").catch(() => []),
    getUserActivity(user.login).catch(() => null),
  ])
  const top = sortReposForFeatured(repos.filter((r) => !r.fork))[0]
  return {
    login: user.login,
    followers: user.followers,
    publicRepos: user.publicRepos,
    topRepoStars: top?.stargazersCount ?? 0,
    pushes: activity?.pushes ?? 0,
  }
}
