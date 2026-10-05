export type GitHubUserSummary = {
  login: string
  name: string | null
  avatarUrl: string
  bio: string | null
  location: string | null
  company: string | null
  blog: string | null
  publicRepos: number
  followers: number
  following: number
  htmlUrl: string
  createdAt: string | null
}

export type GitHubRepoSummary = {
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  stargazersCount: number
  forksCount: number
  language: string | null
  updatedAt: string
  fork: boolean
}

export type LanguageStat = {
  name: string
  percentage: number
  bytes?: number
}

export type GitHubRepoDetail = GitHubRepoSummary & {
  defaultBranch: string
  license: string | null
  openIssuesCount: number
  sizeKb: number
  createdAt: string
  pushedAt: string
}

/** A node in a repository file tree, built from the GitHub Git Trees API. */
export type RepoTreeFile = {
  id: string
  name: string
  type: "file" | "folder"
  path: string
  size: number | null
  children?: RepoTreeFile[]
}

/** One day of public contribution activity for a developer. */
export type ContributionPoint = {
  /** Short axis label, e.g. "Sep 20". */
  date: string
  /** ISO calendar day in UTC, e.g. "2025-09-20". */
  isoDate: string
  /** Push events. GitHub no longer exposes per-push commit counts publicly. */
  pushes: number
  prs: number
  issues: number
}

/** Aggregated public activity for a developer over a rolling window. */
export type DevActivity = {
  points: ContributionPoint[]
  /** Number of days actually covered by the retrieved events. */
  windowDays: number
  /**
   * True authored-commit count for the window, from the commits search API.
   * `null` when the lookup was unavailable (rate limited / unauthorised).
   */
  commits: number | null
  pushes: number
  prs: number
  issues: number
}
