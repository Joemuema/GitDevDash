import { requireRole } from "@/lib/auth/require-role"

/**
 * Developer-only subtree. Anonymous and role-less users go to `/welcome`;
 * hirers are sent to their own home instead of a dead end.
 */
export default async function GrowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("developer", "/grow")
  return <>{children}</>
}
