import { MatchIntake } from "@/components/match/match-intake"
import { MatchShareActions } from "@/components/match/match-share-actions"
import { MatchShortlist } from "@/components/match/match-shortlist"
import { CompareTable } from "@/components/match/compare-table"
import { SavedJdsPanel } from "@/components/match/saved-jds-panel"
import { ShortlistSaver } from "@/components/match/shortlist-saver"
import { ShortlistsPanel } from "@/components/match/shortlists-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageContainer } from "@/components/layout/page-container"
import { PageSection } from "@/components/layout/page-section"
import { requireRole } from "@/lib/auth/require-role"
import { getMyShortlists } from "@/lib/hire/actions"
import {
  getEndorsementCounts,
  getOwnEndorsements,
} from "@/lib/hire/endorsements"
import { assembleJdPool } from "@/lib/hire/jd-pool"
import { recordDemand } from "@/lib/grow/demand"
import {
  batchMatchDevelopers,
  parseBatchMatchParams,
} from "@/lib/match/match-batch"
import { parseJdParam } from "@/lib/match/jd-param"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"

type HirePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Step 9 — hirer JD search + ranking.
 *
 * `?jd=<base64url>&devs=a,b&loc=Berlin` drives everything: the JD is parsed
 * with the Step 1 parser, the pool assembles pasted logins first and tops up
 * from a JD-constrained GitHub search, then `batchMatchDevelopers` scores the
 * pool with the untouched Step 4 pipeline. The location override only steers
 * the discovery leg, never the pasted candidates.
 */
export default async function HirePage({ searchParams }: HirePageProps) {
  const user = await requireRole("hirer", "/hire")
  const raw = await searchParams
  const { jdEncoded, logins: pastedLogins } = parseBatchMatchParams(raw)
  const jd = parseJdParam(jdEncoded ?? undefined)
  const pick = (key: string) => {
    const v = raw[key]
    return Array.isArray(v) ? v[0] : v
  }
  const locOverride = (pick("loc") ?? "").trim()
  const signal = jd?.signal ?? null

  const pool =
    signal && jd
      ? await assembleJdPool(signal, pastedLogins, 5, locOverride || undefined)
      : null
  // Step 11: feed the anonymized demand radar (counts only, never the JD
  // text or the hirer). Fire-and-forget — results must never wait on it.
  if (signal) {
    void recordDemand(signal.requiredLanguages, signal.requiredFrameworks)
  }
  const batch =
    signal && pool && pool.logins.length > 0
      ? await batchMatchDevelopers(pool.logins, signal).catch(() => null)
      : null
  const scoredLogins = batch ? batch.results.map((r) => r.login) : []
  const [endorsementCounts, ownEndorsements, myShortlists] = await Promise.all([
    getEndorsementCounts(scoredLogins),
    getOwnEndorsements(user.id, scoredLogins),
    getMyShortlists(),
  ])

  return (
    <PageContainer className="space-y-8">
      <PageSection
        title={`Hire faster, ${user.name}`}
        description="Paste a job description to rank developers. Scores assist screening only — the final hiring decision stays with human interviewers after onsite interviews."
      >
        <div className="space-y-4">
          <MatchIntake
            defaultJd={jd?.text ?? ""}
            defaultDevs={pastedLogins.join(", ")}
          />
          <SavedJdsPanel
            currentText={jd?.text ?? ""}
            currentLogins={pastedLogins.join(", ")}
          />
        </div>
      </PageSection>
      {jd && signal ? (
        <PageSection
          title={
            signal.title
              ? `Ranked candidates — ${signal.title}`
              : "Ranked candidates"
          }
          description={
            signal.requiredLanguages.length > 0 ||
            signal.requiredFrameworks.length > 0
              ? `Looking for ${[...signal.requiredLanguages, ...signal.requiredFrameworks].join(", ")}${locOverride ? ` in ${locOverride}` : ""}.`
              : "Ranked by heuristic fit across languages, stack, relevance, quality and activity."
          }
        >
          {pool && batch ? (
            <div className="space-y-4">
              {pool.searchDegraded ? (
                <Alert>
                  <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
                  <AlertTitle>GitHub search unavailable</AlertTitle>
                  <AlertDescription>
                    Discovery search failed (rate limit or network), so these
                    results cover only your pasted candidates. Retry shortly for
                    the full pool.
                  </AlertDescription>
                </Alert>
              ) : null}
              <MatchShareActions batch={batch} />
              <MatchShortlist
                batch={batch}
                jdEncoded={jdEncoded!}
                jdTags={[
                  ...signal.requiredLanguages,
                  ...signal.requiredFrameworks,
                ]}
                endorsementCounts={endorsementCounts}
                ownEndorsements={ownEndorsements}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {pool && pool.logins.length === 0
                ? "No candidates found. Paste logins, add favorites, or retry — the JD-constrained search came back empty."
                : "Scoring failed (rate limit or network). Try fewer candidates or retry shortly."}
            </p>
          )}
        </PageSection>
      ) : null}
      {signal && batch && batch.results.length > 1 ? (
        <PageSection
          title="Side-by-side compare"
          description="Same results, transposed for the interview handoff — candidates as columns, signals as rows."
        >
          <CompareTable
            results={batch.results}
            jdEncoded={jdEncoded!}
            endorsementCounts={endorsementCounts}
          />
        </PageSection>
      ) : null}
      {jd && signal ? (
        <PageSection
          title="Interview handoff"
          description="Save this run under a name with notes, or reload a saved shortlist."
        >
          <div className="space-y-4">
            <ShortlistSaver jdText={jd.text} logins={pastedLogins.join(", ")} />
            <ShortlistsPanel shortlists={myShortlists} />
          </div>
        </PageSection>
      ) : (
        <PageSection
          title="Saved shortlists"
          description="Named runs with interview notes, ready to reload."
        >
          <ShortlistsPanel shortlists={myShortlists} />
        </PageSection>
      )}
    </PageContainer>
  )
}
