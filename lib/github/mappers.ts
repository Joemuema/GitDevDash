import type {
  GitHubRepoDetail,
  GitHubRepoSummary,
  GitHubUserSummary,
  LanguageStat,
} from "@/lib/types/github"

type ApiUser = {
  login: string
  name?: string | null
  avatar_url?: string
  bio?: string | null
  location?: string | null
  company?: string | null
  blog?: string | null
  public_repos?: number
  followers?: number
  following?: number
  html_url?: string
  created_at?: string | null
}

type ApiRepo = {
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  pushed_at?: string
  fork: boolean
  default_branch?: string
  license?: { spdx_id: string | null; name: string } | null
  open_issues_count?: number
  size?: number
  created_at?: string
}

export function mapUser(
  api: ApiUser,
  loginFallback?: string
): GitHubUserSummary {
  const login = api.login ?? loginFallback ?? "unknown"
  return {
    login,
    name: api.name ?? null,
    avatarUrl: api.avatar_url ?? `https://github.com/${login}.png`,
    bio: api.bio ?? null,
    location: api.location ?? null,
    company: api.company ?? null,
    blog: api.blog ?? null,
    publicRepos: api.public_repos ?? 0,
    followers: api.followers ?? 0,
    following: api.following ?? 0,
    htmlUrl: api.html_url ?? `https://github.com/${login}`,
    createdAt: api.created_at ?? null,
  }
}

export function mapRepo(api: ApiRepo): GitHubRepoSummary {
  return {
    name: api.name,
    fullName: api.full_name,
    description: api.description,
    htmlUrl: api.html_url,
    stargazersCount: api.stargazers_count,
    forksCount: api.forks_count,
    language: api.language,
    updatedAt: api.updated_at,
    fork: api.fork,
  }
}

export function mapRepoDetail(api: ApiRepo): GitHubRepoDetail {
  return {
    ...mapRepo(api),
    defaultBranch: api.default_branch ?? "main",
    license: api.license?.spdx_id ?? api.license?.name ?? null,
    openIssuesCount: api.open_issues_count ?? 0,
    sizeKb: api.size ?? 0,
    createdAt: api.created_at ?? api.updated_at,
    pushedAt: api.pushed_at ?? api.updated_at,
  }
}

export function mapLanguageStats(
  bytesByLanguage: Record<string, number>
): LanguageStat[] {
  const entries = Object.entries(bytesByLanguage)
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0)
  if (total === 0) return []

  return entries
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: (bytes / total) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

export function mergeLanguageStats(
  collections: Record<string, number>[]
): LanguageStat[] {
  const merged: Record<string, number> = {}
  for (const map of collections) {
    for (const [lang, bytes] of Object.entries(map)) {
      merged[lang] = (merged[lang] ?? 0) + bytes
    }
  }
  return mapLanguageStats(merged)
}
