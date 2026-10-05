export function searchRoute(query?: string, params?: Record<string, string>) {
  const sp = new URLSearchParams(params)
  if (query) sp.set("q", query)
  const qs = sp.toString()
  return qs ? `/search?${qs}` : "/search"
}

export function developerRoute(username: string) {
  return `/developers/${encodeURIComponent(username)}`
}

export function repositoryRoute(username: string, repo: string) {
  return `/developers/${encodeURIComponent(username)}/repos/${encodeURIComponent(repo)}`
}

export const routes = {
  home: "/",
  favorites: "/favorites",
  settings: "/settings",
  search: searchRoute,
  developer: developerRoute,
  repository: repositoryRoute,
} as const
