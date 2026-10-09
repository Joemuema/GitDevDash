export {
  DIMENSION_WEIGHTS,
  MATCH_DIMENSIONS,
  SCORER_VERSION,
  type DeveloperMatch,
  type DeveloperTip,
  type DeveloperTipSeverity,
  type DimensionScore,
  type EvidencePointer,
  type JobSignal,
  type MatchConfidence,
  type MatchDimensionKey,
  type RepoMatch,
  type Seniority,
  type StackEvidence,
} from "@/lib/match/types"
export { parseJobDescription } from "@/lib/match/jd"
export { fingerprintRepoTree } from "@/lib/match/stack"
export {
  scoreDeveloper,
  scoreRepo,
  scoreRepoHeuristic,
  type DeveloperScoringInput,
} from "@/lib/match/rollup"
export {
  clampScore,
  daysSince,
  type RepoScorer,
  type RepoScoringInput,
} from "@/lib/match/scoring"
export {
  scoreActivityDimension,
  scoreLanguageDimension,
  scoreQualityDimension,
  scoreRelevanceDimension,
  scoreStackDimension,
} from "@/lib/match/dimensions"
export { buildTips, type TipsInput } from "@/lib/match/tips"
export {
  batchMatchDevelopers,
  MAX_MATCH_CANDIDATES,
  MATCH_REPOS_PER_CANDIDATE,
  parseBatchMatchParams,
  type BatchCandidateResult,
  type BatchMatchResult,
} from "@/lib/match/match-batch"
export {
  decodeJdParam,
  encodeJdParam,
  parseJdParam,
} from "@/lib/match/jd-param"
export {
  deepScanDeveloper,
  DEFAULT_DEEP_SCAN_LIMIT,
  type DeepScanResult,
  type DeepScanStats,
} from "@/lib/match/deep-scan"
