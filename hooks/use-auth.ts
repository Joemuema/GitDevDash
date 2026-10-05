"use client"

import { useAuthContext } from "@/components/auth/auth-provider"

/**
 * Reads the signed-in user from the auth context seeded by the app layout.
 *
 * `user` is `null` for anonymous visitors; `isAuthenticated` is provided so
 * callers don't have to compare against `null` themselves.
 */
export function useAuth() {
  return useAuthContext()
}
