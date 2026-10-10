"use client"

import { useContext } from "react"

import { SavedJdsContext } from "@/components/match/saved-jds-provider"

/**
 * Reads saved job descriptions from the localStorage-backed context.
 *
 * Anonymous visitors get their own browser-local list; nothing leaves the
 * device. Signed-in hiring teams will later sync these to their account.
 */
export function useSavedJds() {
  const context = useContext(SavedJdsContext)
  if (!context) {
    throw new Error("useSavedJds must be used inside a <SavedJdsProvider>.")
  }
  return context
}
