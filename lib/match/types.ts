export const MATCH_DIMENSIONS = [
  "language",
  "stack",
  "relevance",
  "quality",
  "activity",
] as const

export type MatchDimensionKey = (typeof MATCH_DIMENSIONS)[number]

/**
 * Draft weights for the heuristic scorer (sum = 100). Repo-level scoring uses
 * the first four dimensions (sum = 90); `activity` is developer-level only and
 * is folded in when rolling repos up into a developer score.
 */
export const DIMENSION_WEIGHTS: Record<MatchDimensionKey, number> = {
  language: 30,
  stack: 25,
  relevance: 20,
  quality: 15,
  activity: 10,
}

/** Version tag stamped on every score so a future LLM re-ranker is comparable. */
export const SCORER_VERSION = "heuristic-v1"

export type Seniority = "any" | "junior" | "mid" | "senior"

/** Structured hiring signal extracted from a raw job description. */
export type JobSignal = {
  /** First non-empty line of the JD, or null when the text is blank. */
  title: string | null
  requiredLanguages: string[]
  niceToHaveLanguages: string[]
  requiredFrameworks: string[]
  niceToHaveFrameworks: string[]
  /** Salient content words (not skills) used for repo name/description overlap. */
  keywords: string[]
  seniority: Seniority
  rawText: string
}

/** Pointer back to the concrete data behind a score — no black boxes. */
export type EvidencePointer = {
  label: string
  detail: string
}

export type DimensionScore = {
  key: MatchDimensionKey
  /** 0–100. */
  score: number
  weight: number
  evidence: EvidencePointer[]
}

/** Framework/tool fingerprints detected from a repo file tree (pure). */
export type StackEvidence = {
  /** Normalised names from the same vocabulary as `JobSignal` frameworks. */
  frameworks: string[]
  tools: string[]
  hasReadme: boolean
  hasLicense: boolean
  hasCI: boolean
  hasTests: boolean
  hasDockerfile: boolean
}

export type RepoMatch = {
  repoFullName: string
  /** 0–100 weighted over the repo-level dimensions. */
  score: number
  dimensions: DimensionScore[]
  stack: StackEvidence
  version: string
}

export type MatchConfidence = "high" | "medium" | "low"

export type DeveloperTipSeverity = "quick-win" | "portfolio-gap" | "for-this-jd"

export type DeveloperTip = {
  id: string
  severity: DeveloperTipSeverity
  title: string
  detail: string
  repoFullName?: string
}

export type DeveloperMatch = {
  login: string
  /** 0–100 weighted over all five dimensions. */
  score: number
  dimensions: DimensionScore[]
  topRepos: RepoMatch[]
  confidence: MatchConfidence
  confidenceReasons: string[]
  tips: DeveloperTip[]
  version: string
}
