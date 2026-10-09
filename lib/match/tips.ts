import type { DeveloperMatch, DeveloperTip, JobSignal } from "@/lib/match/types"
import type { DeveloperScoringInput } from "@/lib/match/rollup"

/*
 * Gap analysis: turns a scored match into actionable repo-tailoring advice.
 * Tips reference the concrete repos/files behind them so they stay specific.
 */

export type TipsInput = {
  match: DeveloperMatch
  input: DeveloperScoringInput
  signal: JobSignal
}

function dimScore(match: DeveloperMatch, key: string): number {
  return match.dimensions.find((d) => d.key === key)?.score ?? 0
}

export function buildTips({ match, input, signal }: TipsInput): DeveloperTip[] {
  const tips: DeveloperTip[] = []

  // -- Language gaps (for this JD) -----------------------------------------
  if (signal.requiredLanguages.length > 0 && dimScore(match, "language") < 50) {
    tips.push({
      id: "language-share",
      severity: "for-this-jd",
      title: `Grow ${signal.requiredLanguages[0]} share`,
      detail: `Only a small share of the sampled code is in ${signal.requiredLanguages.join(", ")}. Ship or pin 1–2 ${signal.requiredLanguages[0]}-first projects to lift this dimension.`,
    })
  }

  // -- Stack gaps (for this JD) ---------------------------------------------
  if (signal.requiredFrameworks.length > 0 && dimScore(match, "stack") < 50) {
    const missing = signal.requiredFrameworks.slice(0, 3).join(", ")
    tips.push({
      id: "stack-evidence",
      severity: "for-this-jd",
      title: `Add ${missing} evidence`,
      detail: `No config or manifest fingerprint for ${missing} was found in the top repos. A starter project with its canonical config file (e.g. Dockerfile, framework config) closes this gap.`,
    })
  }

  // -- README / LICENSE quick wins ------------------------------------------
  const withoutReadme = input.repoMatches.filter((m) => !m.stack.hasReadme)
  if (withoutReadme.length > 0) {
    const target = withoutReadme.sort((a, b) => b.score - a.score)[0]
    tips.push({
      id: "add-readme",
      severity: "quick-win",
      title: "Add a README to your best repo",
      detail: `${target.repoFullName} scores well but has no README. A short README with setup steps and a screenshot is the cheapest quality lift available.`,
      repoFullName: target.repoFullName,
    })
  }

  const withoutLicense = input.repoMatches.filter((m) => !m.stack.hasLicense)
  if (withoutLicense.length >= 2) {
    tips.push({
      id: "add-license",
      severity: "quick-win",
      title: `License ${withoutLicense.length} unlicensed repos`,
      detail:
        "Hiring teams treat an explicit license as a maintenance signal. MIT or Apache-2.0 via a LICENSE file takes a minute per repo.",
    })
  }

  // -- Stale flagship ---------------------------------------------------------
  const staleTop = match.topRepos.find((m) => {
    const issue = m.dimensions
      .find((d) => d.key === "quality")
      ?.evidence.find((e) => e.label === "Stale")
    return Boolean(issue)
  })
  if (staleTop) {
    tips.push({
      id: "refresh-flagship",
      severity: "portfolio-gap",
      title: "Refresh your flagship repo",
      detail: `${staleTop.repoFullName} is a top match but hasn't been updated in over a year. A maintenance release — dependency bumps, README refresh — restores its quality score.`,
      repoFullName: staleTop.repoFullName,
    })
  }

  // -- Thin activity -----------------------------------------------------------
  if (input.activity && dimScore(match, "activity") < 40) {
    tips.push({
      id: "steady-activity",
      severity: "portfolio-gap",
      title: "Show steadier activity",
      detail: `Only ${input.activity.pushes} pushes and ${input.activity.prs} PRs in the last ${input.activity.windowDays} days. Sustained small PRs read better than one big push.`,
    })
  }
  if (!input.activity) {
    tips.push({
      id: "no-activity-data",
      severity: "portfolio-gap",
      title: "Activity data is missing",
      detail:
        "No public events were available, so activity scored zero. Public commits, PRs and issues in the next two weeks will fix this automatically.",
    })
  }

  // -- Thin portfolio -----------------------------------------------------------
  if (input.repoMatches.length < 3) {
    tips.push({
      id: "thin-portfolio",
      severity: "portfolio-gap",
      title: "Portfolio looks thin",
      detail: `Only ${input.repoMatches.length} repos could be scored. Two or three focused, documented projects beat a dozen empty forks.`,
    })
  }

  return tips
}
