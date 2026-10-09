import type { DevActivity, LanguageStat } from "@/lib/types/github"
import {
  DIMENSION_WEIGHTS,
  SCORER_VERSION,
  type DeveloperMatch,
  type DimensionScore,
  type JobSignal,
  type MatchConfidence,
  type MatchDimensionKey,
  type RepoMatch,
} from "@/lib/match/types"
import { fingerprintRepoTree } from "@/lib/match/stack"
import {
  scoreActivityDimension,
  scoreLanguageDimension,
  scoreQualityDimension,
  scoreRelevanceDimension,
  scoreStackDimension,
} from "@/lib/match/dimensions"
import {
  clampScore,
  type RepoScorer,
  type RepoScoringInput,
} from "@/lib/match/scoring"
import { buildTips } from "@/lib/match/tips"

/*
 * Developer rollup + `scoreRepo` seam. To add an LLM re-ranker later, wrap or
 * replace the `scoreRepo` binding — the signature stays the same.
 */

export type { RepoScorer, RepoScoringInput }

export type DeveloperScoringInput = {
  login: string
  /** Aggregate language stats (from `getUserLanguageOverview`). */
  languages: LanguageStat[]
  sampledRepoCount: number
  activity: DevActivity | null
  repoMatches: RepoMatch[]
}

export function scoreRepoHeuristic(
  input: RepoScoringInput,
  signal: JobSignal
): RepoMatch {
  const stack = fingerprintRepoTree(input.tree)
  const dimensions: DimensionScore[] = [
    scoreLanguageDimension(input.languages, signal),
    scoreStackDimension(stack, signal),
    scoreRelevanceDimension(input.repo.name, input.repo.description, signal),
    scoreQualityDimension(input.repo, stack),
  ]
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0)
  const total = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  return {
    repoFullName: input.repo.fullName,
    score: clampScore(total / totalWeight),
    dimensions,
    stack,
    version: SCORER_VERSION,
  }
}

/** Default repo scorer. Swap this binding to plug in an LLM re-ranker. */
export const scoreRepo: RepoScorer = scoreRepoHeuristic

function bestScore(
  matches: RepoMatch[],
  key: MatchDimensionKey
): DimensionScore | null {
  let best: DimensionScore | null = null
  for (const match of matches) {
    const dim = match.dimensions.find((d) => d.key === key)
    if (dim && (!best || dim.score > best.score)) {
      best = { ...dim, evidence: [...dim.evidence] }
    }
  }
  return best
}

function assessConfidence(input: DeveloperScoringInput): {
  confidence: MatchConfidence
  reasons: string[]
} {
  const reasons: string[] = []
  if (input.repoMatches.length < 3) {
    reasons.push(
      `Only ${input.repoMatches.length} repos scored — the match is provisional.`
    )
  }
  if (input.sampledRepoCount < 3) {
    reasons.push("Fewer than 3 non-fork repos sampled for languages.")
  }
  if (!input.activity) {
    reasons.push("No public activity data was available.")
  }
  if (reasons.length === 0) return { confidence: "high", reasons: [] }
  if (input.repoMatches.length >= 3 && input.activity) {
    return { confidence: "medium", reasons }
  }
  return { confidence: "low", reasons }
}

export function scoreDeveloper(
  input: DeveloperScoringInput,
  signal: JobSignal
): DeveloperMatch {
  const language = scoreLanguageDimension(input.languages, signal)
  const stack = bestScore(input.repoMatches, "stack") ?? {
    key: "stack" as const,
    score: 0,
    weight: DIMENSION_WEIGHTS.stack,
    evidence: [
      {
        label: "No repos scored",
        detail: "Stack evidence needs at least one scored repo.",
      },
    ],
  }
  const relevance = bestScore(input.repoMatches, "relevance") ?? {
    key: "relevance" as const,
    score: 0,
    weight: DIMENSION_WEIGHTS.relevance,
    evidence: [
      {
        label: "No repos scored",
        detail: "Relevance needs at least one scored repo.",
      },
    ],
  }

  const topQuality = [...input.repoMatches]
    .sort((a, b) => {
      const qa = a.dimensions.find((d) => d.key === "quality")?.score ?? 0
      const qb = b.dimensions.find((d) => d.key === "quality")?.score ?? 0
      return qb - qa
    })
    .slice(0, 3)
  const quality: DimensionScore = {
    key: "quality",
    score:
      topQuality.length === 0
        ? 0
        : Math.round(
            topQuality.reduce(
              (sum, m) =>
                sum +
                (m.dimensions.find((d) => d.key === "quality")?.score ?? 0),
              0
            ) / topQuality.length
          ),
    weight: DIMENSION_WEIGHTS.quality,
    evidence: [
      {
        label:
          topQuality.length === 0
            ? "No repos scored"
            : `Averaged over top ${topQuality.length}: ${topQuality.map((m) => m.repoFullName.split("/")[1]).join(", ")}`,
        detail:
          "Quality averages the best repos rather than the whole portfolio.",
      },
    ],
  }

  const activity = scoreActivityDimension(input.activity)
  const dimensions = [language, stack, relevance, quality, activity]
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0)
  const total = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  const topRepos = [...input.repoMatches]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  const { confidence, reasons } = assessConfidence(input)

  const match: DeveloperMatch = {
    login: input.login,
    score: clampScore(total / totalWeight),
    dimensions,
    topRepos,
    confidence,
    confidenceReasons: reasons,
    tips: [],
    version: SCORER_VERSION,
  }
  match.tips = buildTips({ match, input, signal })
  return match
}
