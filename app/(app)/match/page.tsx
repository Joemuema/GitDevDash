import { redirect } from "next/navigation"

/**
 * Legacy Step 4 entry point, retired by Step 9.
 *
 * The hirer workspace (`/hire`) owns JD search + ranking now; the shared
 * intake (`MatchIntake`) already pushes `?jd=&devs=` there. Keep the route
 * alive as a redirect so old share links land in the right place.
 */
export default async function MatchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      if (value[0] !== undefined) qs.set(key, value[0])
    } else if (value !== undefined) {
      qs.set(key, value)
    }
  }
  const suffix = qs.size > 0 ? `?${qs.toString()}` : ""
  redirect(`/hire${suffix}`)
}
