import { MatchIntake } from "@/components/match/match-intake"
import { MatchShareActions } from "@/components/match/match-share-actions"
import { MatchShortlist } from "@/components/match/match-shortlist"
import { SavedJdsPanel } from "@/components/match/saved-jds-panel"
import { PageSection } from "@/components/layout/page-section"
import { PageContainer } from "@/components/layout/page-container"
import {
  batchMatchDevelopers,
  parseBatchMatchParams,
} from "@/lib/match/match-batch"
import { parseJdParam } from "@/lib/match/jd-param"

type MatchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MatchPage({ searchParams }: MatchPageProps) {
  const raw = await searchParams
  const { jdEncoded, logins } = parseBatchMatchParams(raw)
  const jd = parseJdParam(jdEncoded ?? undefined)

  const batch =
    jd && logins.length > 0
      ? await batchMatchDevelopers(logins, jd.signal).catch(() => null)
      : null

  return (
    <PageContainer className="space-y-8">
      <PageSection
        title="Match candidates"
        description="Paste a job description and a comma-separated shortlist. Scores rank who to invite onsite — interviewers make the final call."
      >
        <div className="space-y-4">
          <MatchIntake
            defaultJd={jd?.text ?? ""}
            defaultDevs={logins.join(", ")}
          />
          <SavedJdsPanel
            currentText={jd?.text ?? ""}
            currentLogins={logins.join(", ")}
          />
        </div>
      </PageSection>
      {jd && logins.length > 0 ? (
        <PageSection
          title={
            jd.signal.title ? `Shortlist — ${jd.signal.title}` : "Shortlist"
          }
          description={
            jd.signal.requiredLanguages.length > 0 ||
            jd.signal.requiredFrameworks.length > 0
              ? `Looking for ${[...jd.signal.requiredLanguages, ...jd.signal.requiredFrameworks].join(", ")}.`
              : "Ranked by heuristic fit across languages, stack, relevance, quality and activity."
          }
        >
          {batch ? (
            <div className="space-y-4">
              <MatchShareActions batch={batch} />
              <MatchShortlist batch={batch} jdEncoded={jdEncoded!} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Scoring failed (rate limit or network). Try fewer candidates or
              retry shortly.
            </p>
          )}
        </PageSection>
      ) : null}
    </PageContainer>
  )
}
