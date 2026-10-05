"use server"

import { getUsers } from "@/lib/github/users"
import type { GitHubUserSummary } from "@/lib/types/github"

export async function refreshFavoriteUsers(
  logins: string[]
): Promise<GitHubUserSummary[]> {
  return getUsers(logins)
}
