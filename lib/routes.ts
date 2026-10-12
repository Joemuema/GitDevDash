export function searchRoute(query?: string, params?: Record<string, string>) {
  const sp = new URLSearchParams(params)
  if (query) sp.set("q", query)
  const qs = sp.toString()
  return qs ? `/search?${qs}` : "/search"
}

export function developerRoute(username: string) {
  return `/developers/${encodeURIComponent(username)}`
}

export function matchRoute(params?: Record<string, string>) {
  const sp = new URLSearchParams(params)
  const qs = sp.toString()
  return qs ? `/match?${qs}` : "/match"
}

export function developerMatchRoute(username: string, jdEncoded: string) {
  return `${developerRoute(username)}?jd=${encodeURIComponent(jdEncoded)}`
}

export function repositoryRoute(username: string, repo: string) {
  return `/developers/${encodeURIComponent(username)}/repos/${encodeURIComponent(repo)}`
}

export function hireJdRoute(jdEncoded: string, extra?: Record<string, string>) {
  const sp = new URLSearchParams(extra)
  sp.set("jd", jdEncoded)
  return `/hire?${sp.toString()}`
}

export const routes = {
  home: "/",
  favorites: "/favorites",
  settings: "/settings",
  welcome: "/welcome",
  hire: {
    home: "/hire",
    jd: hireJdRoute,
  },
  grow: {
    home: "/grow",
  },
  match: matchRoute,
  search: searchRoute,
  developer: developerRoute,
  developerMatch: developerMatchRoute,
  repository: repositoryRoute,
} as const
