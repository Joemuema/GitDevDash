"use client"

import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react"
import type { ReactNode } from "react"

import {
  createSavedJdId,
  getSavedJdsServerSnapshot,
  getSavedJdsSnapshot,
  mutateSavedJds,
  setSavedJds,
  subscribeToSavedJds,
  type SavedJd,
} from "@/lib/match/saved-jds"

type SavedJdsContextValue = {
  savedJds: SavedJd[]
  count: number
  isReady: boolean
  saveJd: (title: string, text: string, logins: string[]) => SavedJd
  removeJd: (id: string) => void
  clearAllJds: () => void
}

export const SavedJdsContext = createContext<SavedJdsContextValue | null>(null)

const isHydratedOnClient = () => true
const isHydratedOnServer = () => false

export function SavedJdsProvider({ children }: { children: ReactNode }) {
  const savedJds = useSyncExternalStore(
    subscribeToSavedJds,
    getSavedJdsSnapshot,
    getSavedJdsServerSnapshot
  )

  // `false` while server rendering and during hydration, `true` once the
  // client has access to storage. Keeps the first client render identical to
  // the server render so hydration never mismatches.
  const isReady = useSyncExternalStore(
    subscribeToSavedJds,
    isHydratedOnClient,
    isHydratedOnServer
  )

  const saveJd = useCallback(
    (title: string, text: string, logins: string[]): SavedJd => {
      const entry: SavedJd = {
        id: createSavedJdId(),
        title: title.trim() || "Untitled role",
        text,
        logins,
        savedAt: new Date().toISOString(),
      }
      mutateSavedJds((prev) => [entry, ...prev])
      return entry
    },
    []
  )

  const removeJd = useCallback((id: string) => {
    mutateSavedJds((prev) => prev.filter((j) => j.id !== id))
  }, [])

  const clearAllJds = useCallback(() => {
    setSavedJds([])
  }, [])

  const value = useMemo(
    () => ({
      savedJds,
      count: savedJds.length,
      isReady,
      saveJd,
      removeJd,
      clearAllJds,
    }),
    [savedJds, isReady, saveJd, removeJd, clearAllJds]
  )

  return (
    <SavedJdsContext.Provider value={value}>
      {children}
    </SavedJdsContext.Provider>
  )
}
