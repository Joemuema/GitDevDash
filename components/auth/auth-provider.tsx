"use client"

import { createContext, useContext } from "react"

import type { SessionUser } from "@/lib/auth/types"

/**
 * Auth state for Client Components.
 *
 * React context can't be read by Server Components, so the value is seeded by
 * `app/(app)/layout.tsx` from the server-side session and passed down as a prop.
 * Because the provider holds no state of its own, a `router.refresh()` (or a
 * Server Action revalidation) re-renders the layout and every consumer sees the
 * fresh user without any manual syncing.
 */

export type AuthContextValue = {
  user: SessionUser | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export { AuthContext }

export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser | null
  children: React.ReactNode
}) {
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>.")
  }
  return context
}
