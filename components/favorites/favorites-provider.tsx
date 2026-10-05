"use client"

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import {
  createStoredFavorite,
  getFavoritesServerSnapshot,
  getFavoritesSnapshot,
  mutateFavorites,
  setFavorites,
  subscribeToFavorites,
  type StoredFavorite,
} from "@/lib/favorites/storage"
import type { GitHubUserSummary } from "@/lib/types/github"

type FavoritesContextValue = {
  favorites: StoredFavorite[]
  count: number
  isReady: boolean
  isFavorite: (login: string) => boolean
  addFavorite: (user: GitHubUserSummary) => void
  removeFavorite: (login: string) => void
  toggleFavorite: (user: GitHubUserSummary) => void
  clearAllFavorites: () => void
  replaceFavorites: (next: StoredFavorite[]) => void
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null
)

const isHydratedOnClient = () => true
const isHydratedOnServer = () => false

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favorites = useSyncExternalStore(
    subscribeToFavorites,
    getFavoritesSnapshot,
    getFavoritesServerSnapshot
  )

  // `false` while server rendering and during hydration, `true` once the client
  // has access to storage. Keeps the first client render identical to the
  // server render so hydration never mismatches.
  const isReady = useSyncExternalStore(
    subscribeToFavorites,
    isHydratedOnClient,
    isHydratedOnServer
  )

  const isFavorite = useCallback(
    (login: string) =>
      favorites.some((f) => f.login === login.toLowerCase()),
    [favorites]
  )

  const addFavorite = useCallback((user: GitHubUserSummary) => {
    const key = user.login.toLowerCase()
    mutateFavorites((prev) =>
      prev.some((f) => f.login === key)
        ? prev.map((f) =>
            f.login === key
              ? { ...f, user, savedAt: new Date().toISOString() }
              : f
          )
        : [createStoredFavorite(user), ...prev]
    )
  }, [])

  const removeFavorite = useCallback((login: string) => {
    const key = login.toLowerCase()
    mutateFavorites((prev) => prev.filter((f) => f.login !== key))
  }, [])

  const toggleFavorite = useCallback(
    (user: GitHubUserSummary) => {
      if (isFavorite(user.login)) removeFavorite(user.login)
      else addFavorite(user)
    },
    [addFavorite, isFavorite, removeFavorite]
  )

  const clearAllFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  const replaceFavorites = useCallback((next: StoredFavorite[]) => {
    setFavorites(next)
  }, [])

  const value = useMemo(
    () => ({
      favorites,
      count: favorites.length,
      isReady,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearAllFavorites,
      replaceFavorites,
    }),
    [
      favorites,
      isReady,
      isFavorite,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearAllFavorites,
      replaceFavorites,
    ]
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}