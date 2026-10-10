export const SAVED_JDS_STORAGE_KEY = "gitdevdash:saved-jds:v1"

export type SavedJd = {
  id: string
  title: string
  text: string
  logins: string[]
  savedAt: string
}

function isSavedJd(value: unknown): value is SavedJd {
  if (!value || typeof value !== "object") return false
  const v = value as SavedJd
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.text === "string" &&
    Array.isArray(v.logins) &&
    v.logins.every((l) => typeof l === "string") &&
    typeof v.savedAt === "string"
  )
}

export function readSavedJdsFromStorage(): SavedJd[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(SAVED_JDS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSavedJd)
  } catch {
    return []
  }
}

function writeSavedJdsToStorage(jds: SavedJd[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SAVED_JDS_STORAGE_KEY, JSON.stringify(jds))
}

/* -------------------------------------------------------------------------- */
/* External store                                                             */
/* -------------------------------------------------------------------------- */
/*
 * Same pattern as `lib/favorites/storage.ts`: localStorage is an external
 * system, so React reads it with `useSyncExternalStore` instead of syncing
 * state inside an effect.
 */

const EMPTY_SAVED_JDS: SavedJd[] = []
const listeners = new Set<() => void>()
let cache: SavedJd[] = EMPTY_SAVED_JDS
let hydrated = false

function notify() {
  for (const listener of listeners) listener()
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key === null || event.key === SAVED_JDS_STORAGE_KEY) {
    cache = readSavedJdsFromStorage()
    notify()
  }
}

export function getSavedJdsSnapshot(): SavedJd[] {
  if (typeof window === "undefined") return EMPTY_SAVED_JDS
  if (!hydrated) {
    cache = readSavedJdsFromStorage()
    hydrated = true
  }
  return cache
}

export function getSavedJdsServerSnapshot(): SavedJd[] {
  return EMPTY_SAVED_JDS
}

export function subscribeToSavedJds(listener: () => void): () => void {
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

export function setSavedJds(next: SavedJd[]): void {
  cache = next
  hydrated = true
  if (typeof window !== "undefined") writeSavedJdsToStorage(next)
  notify()
}

export function mutateSavedJds(
  updater: (current: SavedJd[]) => SavedJd[]
): void {
  setSavedJds(updater(getSavedJdsSnapshot()))
}

export function createSavedJdId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
