import type { GitHubUserSummary } from "@/lib/types/github"

export const FAVORITES_STORAGE_KEY = "gitdevdash:favorites:v1"

export type StoredFavorite = {
  login: string
  savedAt: string
  user: GitHubUserSummary
}

function isStoredFavorite(value: unknown): value is StoredFavorite {
  if (!value || typeof value !== "object") return false
  const v = value as StoredFavorite
  return (
    typeof v.login === "string" &&
    typeof v.savedAt === "string" &&
    v.user != null &&
    typeof v.user.login === "string"
  )
}

export function readFavoritesFromStorage(): StoredFavorite[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStoredFavorite)
  } catch {
    return []
  }
}

export function writeFavoritesToStorage(favorites: StoredFavorite[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
}

export function createStoredFavorite(user: GitHubUserSummary): StoredFavorite {
  return {
    login: user.login.toLowerCase(),
    savedAt: new Date().toISOString(),
    user,
  }
}

/* -------------------------------------------------------------------------- */
/* External store                                                             */
/* -------------------------------------------------------------------------- */
/*
 * Favorites live in localStorage, which is an external system. Exposing them
 * through a tiny store lets React read them with `useSyncExternalStore` instead
 * of syncing state inside an effect, which avoids a cascading render on mount.
 */

const EMPTY_FAVORITES: StoredFavorite[] = []
const listeners = new Set<() => void>()
let cache: StoredFavorite[] = EMPTY_FAVORITES
let hydrated = false

function notify() {
  for (const listener of listeners) listener()
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key === null || event.key === FAVORITES_STORAGE_KEY) {
    cache = readFavoritesFromStorage()
    notify()
  }
}

export function getFavoritesSnapshot(): StoredFavorite[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES
  if (!hydrated) {
    cache = readFavoritesFromStorage()
    hydrated = true
  }
  return cache
}

export function getFavoritesServerSnapshot(): StoredFavorite[] {
  return EMPTY_FAVORITES
}

export function subscribeToFavorites(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {}

  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorageEvent)
  }
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorageEvent)
    }
  }
}

export function setFavorites(next: StoredFavorite[]): void {
  cache = next
  hydrated = true
  if (typeof window !== "undefined") writeFavoritesToStorage(next)
  notify()
}

export function mutateFavorites(
  updater: (current: StoredFavorite[]) => StoredFavorite[]
): void {
  setFavorites(updater(getFavoritesSnapshot()))
}
