import Link from "next/link"
import { redirect } from "next/navigation"

import { RolePicker } from "@/components/onboarding/role-picker"
import { PageContainer } from "@/components/layout/page-container"
import { PageSection } from "@/components/layout/page-section"
import { getCurrentUser } from "@/lib/auth/dal"
import { roleHome } from "@/lib/auth/roles"
import { routes } from "@/lib/routes"

/**
 * Role picker entry point.
 *
 * Signed-out visitors see sign-in guidance plus the base app links. Signed-in
 * users with a role are sent straight to their interface. Signed-in users
 * without one get the picker; `?next=` returns them where they were headed.
 */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const user = await getCurrentUser()
  const params = await searchParams
  const next = typeof params.next === "string" && params.next.startsWith("/") ? params.next : null

  if (user?.role) {
    redirect(next ?? roleHome(user.role))
  }

  return (
    <PageContainer>
      <PageSection
        title="Welcome to GitDevDash"
        description={
          user
            ? "One last step — pick the interface that fits how you'll use the app."
            : "Sign in, then pick the interface that fits how you'll use the app."
        }
      >
        {user ? (
          <RolePicker currentRole={user.role} />
        ) : (
          <div className="max-w-2xl space-y-3 text-sm text-muted-foreground">
            <p>
              Hirers match developers against job descriptions. Developers grow
              visibility and tailor repos. Every base feature — search, profiles,
              repos, favorites — stays available either way.
            </p>
            <p>
              Use the <span className="font-medium text-foreground">Sign in</span>{" "}
              button in the header to continue
              {next ? (
                <>
                  {" "}— you&apos;ll come back to{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">{next}</code>
                </>
              ) : null}
              . Or keep exploring without an account:{" "}
              <Link className="underline" href={routes.search()}>
                search developers
              </Link>
              .
            </p>
          </div>
        )}
      </PageSection>
    </PageContainer>
  )
}
