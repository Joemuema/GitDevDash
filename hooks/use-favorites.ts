"use client"

import { useCallback, useContext } from "react"

import { FavoritesContext } from "@/components/favorites/favorites-provider"
import type { GitHubUserSummary } from "@/lib/types/github"

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider")
  }
  const {
    favorites,
    isReady,
    count,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    replaceFavorites,
  } = ctx

  return {
    favorites,
    count,
    isReady,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    replaceFavorites,
  }
}

export function useFavoriteUser(user: GitHubUserSummary) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const saved = isFavorite(user.login)
  const toggle = useCallback(() => toggleFavorite(user), [toggleFavorite, user])
  return { isFavorite: saved, toggleFavorite: toggle }
}
