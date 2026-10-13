import { CoverageGaps } from "@/components/grow/coverage-gaps"
import { DemandRadar } from "@/components/grow/demand-radar"
import { PeerCompare } from "@/components/grow/peer-compare"
import { SeoChecklist } from "@/components/grow/seo-checklist"
import { ViewsPanel } from "@/components/grow/views-panel"
import { TipsPanel } from "@/components/match/tips-panel"
import { PlanTable } from "@/components/billing/plan-table"
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
import { getRepository, listUserRepos } from "@/lib/github/repos"
import { getRepoTree } from "@/lib/github/tree"
import { getUser } from "@/lib/github/users"
import { getDemandSnapshot } from "@/lib/grow/demand"
import { getImpressionSummary } from "@/lib/grow/impressions"
import { buildPeerCohort, ownPeerStat } from "@/lib/grow/peers"
import { scanGeneralTips } from "@/lib/grow/portfolio-tips"
import { scoreSeoProfile } from "@/lib/grow/seo"
import { DEVELOPER_PLAN } from "@/lib/billing/plans"
import { fingerprintRepoTree } from "@/lib/match/stack"

/**
 * Gathers the SEO inputs for a linked GitHub profile: the user record, the
 * top-3 non-fork repo descriptions, and README/LICENSE presence from their
 * file trees (via the same tree fingerprints the match engine uses).
 */
async function buildSeoInput(
  githubLogin: string,
  demandTerms: string[] | null
) {
  const user = await getUser(githubLogin)
  const repos = await listUserRepos(githubLogin, "updated").catch(() => [])
  const top = repos.filter((r) => !r.fork).slice(0, 3)
  const flags = await Promise.all(
    top.map(async (repo) => {
      try {
        const detail = await getRepository(githubLogin, repo.name)
        const tree = await getRepoTree(
          githubLogin,
          repo.name,
          detail.defaultBranch
        )
          .then((result) => result.files)
          .catch(() => [])
        const stack = fingerprintRepoTree(tree)
        return {
          description: repo.description ?? "",
          hasReadme: stack.hasReadme,
          hasLicense: stack.hasLicense || detail.license !== null,
        }
      } catch {
        return {
          description: repo.description ?? "",
          hasReadme: false,
          hasLicense: false,
        }
      }
    })
  )
  return scoreSeoProfile({
    user,
    repoDescriptions: flags.map((f) => f.description),
    hasReadme: flags.some((f) => f.hasReadme),
    hasLicense: flags.some((f) => f.hasLicense),
    demandTerms: demandTerms ?? [],
  })
}

async function buildPeers(githubLogin: string) {
  const user = await getUser(githubLogin)
  const languages = await getUserLanguageOverview(githubLogin)
    .then((result) => result.languages)
    .catch(() => [])
  const [cohort, own] = await Promise.all([
    buildPeerCohort(user, languages[0]?.name ?? null),
    ownPeerStat(user),
  ])
  return { cohort, own, topLanguage: languages[0]?.name ?? null }
}

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

  const demand = await getDemandSnapshot(10)
  const demandTerms = [
    ...demand.languages.map((l) => l.name),
    ...demand.frameworks.map((f) => f.name),
  ]
  const [ownLanguages, seo, peers, portfolio] = await Promise.all([
    githubLogin
      ? getUserLanguageOverview(githubLogin)
          .then((result) => result.languages)
          .catch(() => [])
      : Promise.resolve([]),
    githubLogin
      ? buildSeoInput(githubLogin, demandTerms).catch(() => null)
      : Promise.resolve(null),
    githubLogin
      ? buildPeers(githubLogin).catch(() => null)
      : Promise.resolve(null),
    githubLogin
      ? scanGeneralTips(githubLogin).catch(() => null)
      : Promise.resolve(null),
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
        title="Discoverability checklist"
        description="Profile signals hirers filter on — bio, location, repos, README, license, keywords."
      >
        <Card>
          <CardContent className="pt-6">
            {seo ? (
              <SeoChecklist
                checks={seo.checks}
                passed={seo.passed}
                total={seo.total}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Link your GitHub profile with{" "}
                <code className="rounded bg-muted px-1 font-mono text-xs">
                  /grow?gh=your-login
                </code>{" "}
                to score your discoverability.
              </p>
            )}
          </CardContent>
        </Card>
      </PageSection>
      <PageSection
        title="You vs peers"
        description="Public-signal medians for developers in your language and follower band."
      >
        <Card>
          <CardContent className="pt-6">
            {peers ? (
              <PeerCompare
                own={peers.own}
                cohort={peers.cohort}
                topLanguage={peers.topLanguage}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Link your GitHub profile with{" "}
                <code className="rounded bg-muted px-1 font-mono text-xs">
                  /grow?gh=your-login
                </code>{" "}
                to compare against similar developers.
              </p>
            )}
          </CardContent>
        </Card>
      </PageSection>
      <PageSection
        title="Repo tailoring tips"
        description="Portfolio health scan — README, license, freshness, activity. Runs without a job description."
      >
        <Card>
          <CardContent className="pt-6">
            {portfolio ? (
              <TipsPanel login={githubLogin} tips={portfolio.match.tips} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Link your GitHub profile with{" "}
                <code className="rounded bg-muted px-1 font-mono text-xs">
                  /grow?gh=your-login
                </code>{" "}
                to scan your repos for quick wins.
              </p>
            )}
          </CardContent>
        </Card>
      </PageSection>
      <PageSection
        title="Developer plan"
        description="What's free today and what Pro unlocks when billing goes live."
      >
        <PlanTable
          title="Developer plan"
          description="Visibility and proof — the tips themselves stay free."
          features={DEVELOPER_PLAN}
        />
      </PageSection>
    </PageContainer>
  )
}
