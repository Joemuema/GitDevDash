import { requireRole } from "@/lib/auth/require-role"

/**
 * Hirer-only subtree. Anonymous and role-less users go to `/welcome`;
 * developers are sent to their own home instead of a dead end.
 */
export default async function HireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("hirer", "/hire")
  return <>{children}</>
}
