import { PageContainer } from "@/components/layout/page-container"
import { PageSection } from "@/components/layout/page-section"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/lib/auth/require-role"

/**
 * Developer workspace home (Step 8 placeholder).
 *
 * Step 11 wires demand + view counts here; Step 12 adds the SEO checklist and
 * peer compare; Step 13 re-homes the repo tailoring `TipsPanel` here.
 */
export default async function GrowPage() {
  const user = await requireRole("developer", "/grow")

  return (
    <PageContainer>
      <PageSection
        title={`Grow your visibility, ${user.name}`}
        description="See what hirers look for, check who found you, and tailor your repos to get picked."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Demand radar</CardTitle>
              <CardDescription>
                Which languages and frameworks hirers actually search for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Demand aggregates land here in Step 11.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Who viewed you</CardTitle>
              <CardDescription>
                Daily view counts from hirer searches — never identities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Impression counts land here in Step 11.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Repo tailoring tips</CardTitle>
              <CardDescription>
                Concrete fixes that raise your match scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The tips panel moves here in Step 13.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </PageContainer>
  )
}
