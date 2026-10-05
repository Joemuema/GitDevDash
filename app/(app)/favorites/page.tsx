"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { FavoritesHeader } from "@/components/favorites/favorites-header"
import { FavoritesList } from "@/components/favorites/favorites-list"
import {
  FavoritesToolbar,
  type FavSort,
} from "@/components/favorites/favorites-toolbar"
import { PageContainer } from "@/components/layout/page-container"
import { refreshFavoriteUsers } from "@/lib/github/actions"
import { useFavorites } from "@/hooks/use-favorites"

export default function FavoritesPage() {
  const { favorites, isReady, clearAllFavorites, replaceFavorites } =
    useFavorites()
  const [filter, setFilter] = useState("")
  const [sort, setSort] = useState<FavSort>("recent")

  // Track which logins have already been fetched to prevent the effect
  // from re-fetching (and causing an infinite loop) when replaceFavorites
  // updates the favorites state.
  const fetchedLoginsRef = useRef(new Set<string>())

  // Refresh favorite user data from GitHub on mount
  useEffect(() => {
    if (!isReady) return

    const logins = favorites.map((f) => f.login)
    const newLogins = logins.filter(
      (login) => !fetchedLoginsRef.current.has(login)
    )
    if (newLogins.length === 0) return

    newLogins.forEach((login) => fetchedLoginsRef.current.add(login))

    void (async () => {
      try {
        const fresh = await refreshFavoriteUsers(newLogins)
        const freshByLogin = new Map(
          fresh.map((u) => [u.login.toLowerCase(), u])
        )
        const merged = favorites.map((fav) => {
          const updated = freshByLogin.get(fav.login)
          return updated ? { ...fav, user: updated } : fav
        })
        replaceFavorites(merged)
      } catch {
        // Keep stale data if refresh fails
      }
    })()
  }, [isReady, favorites, replaceFavorites])

  const displayed = useMemo(() => {
    const term = filter.toLowerCase()
    const filtered = favorites.filter((f) => {
      return (
        f.user.login.toLowerCase().includes(term) ||
        (f.user.name?.toLowerCase().includes(term) ?? false)
      )
    })

    return [...filtered].sort((a, b) => {
      if (sort === "name") {
        return a.user.login.localeCompare(b.user.login)
      }
      if (sort === "followers") {
        return b.user.followers - a.user.followers
      }
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })
  }, [favorites, filter, sort])

  const users = displayed.map((f) => f.user)

  return (
    <PageContainer className="space-y-6">
      <FavoritesHeader count={users.length} />
      <FavoritesToolbar
        filter={filter}
        sort={sort}
        count={users.length}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onClearAll={clearAllFavorites}
      />
      <FavoritesList users={users} />
    </PageContainer>
  )
}
