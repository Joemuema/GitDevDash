import { CoverageGaps } from "@/components/grow/coverage-gaps"
import { DemandRadar } from "@/components/grow/demand-radar"
import { ViewsPanel } from "@/components/grow/views-panel"
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
import { getUserLanguageOverview } from "@/lib/github/languages"
import { getDemandSnapshot } from "@/lib/grow/demand"
import { getImpressionSummary } from "@/lib/grow/impressions"

/**
 * Step 11 — developer demand radar + view counts.
 *
 * `?gh=login` optionally links the developer's GitHub profile for the
 * coverage comparison (accounts don't store a GitHub login yet). Demand and
 * impressions are anonymized aggregates — no hirer identities anywhere.
 *
 * Step 12 adds the SEO checklist and peer compare; Step 13 re-homes the repo
 * tailoring `TipsPanel` here.
 */
export default async function GrowPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireRole("developer", "/grow")
  const raw = await searchParams
  const ghRaw = raw.gh
  const githubLogin = (Array.isArray(ghRaw) ? ghRaw[0] : (ghRaw ?? "")).trim()

  const [demand, ownLanguages] = await Promise.all([
    getDemandSnapshot(10),
    githubLogin
      ? getUserLanguageOverview(githubLogin)
          .then((result) => result.languages)
          .catch(() => [])
      : Promise.resolve([]),
  ])
  // Views are keyed by GitHub login too — without a linked profile there is
  // nothing to look up yet.
  const views = githubLogin
    ? await getImpressionSummary(githubLogin).catch(() => null)
    : null

  return (
    <PageContainer>
      <PageSection
        title={`Grow your visibility, ${user.name}`}
        description="See what hirers look for, check who found you, and tailor your repos to get picked."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Demand radar</CardTitle>
              <CardDescription>
                Which languages and frameworks hirers actually search for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DemandRadar
                languages={demand.languages}
                frameworks={demand.frameworks}
                totalJds={demand.totalJds}
              />
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
              {views ? (
                <ViewsPanel summary={views} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Link your GitHub profile with{" "}
                  <code className="rounded bg-muted px-1 font-mono text-xs">
                    /grow?gh=your-login
                  </code>{" "}
                  to see how often hirers find you.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </PageSection>
      <PageSection
        title="Your coverage vs demand"
        description="How your language mix lines up with what hirers request."
      >
        <Card>
          <CardContent className="pt-6">
            <CoverageGaps
              ownLanguages={ownLanguages.map((l) => ({
                name: l.name,
                percentage: l.percentage,
              }))}
              demandLanguages={demand.languages}
              demandFrameworks={demand.frameworks}
              githubLogin={githubLogin || null}
            />
          </CardContent>
        </Card>
      </PageSection>
      <PageSection
        title="Repo tailoring tips"
        description="Concrete fixes that raise your match scores."
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              The tips panel moves here in Step 13.
            </p>
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  )
}
