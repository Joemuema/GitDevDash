import type {
  GitHubRepoDetail,
  GitHubRepoSummary,
  LanguageStat,
  RepoTreeFile,
} from "@/lib/types/github"
import type { JobSignal, RepoMatch } from "@/lib/match/types"

export type RepoScoringInput = {
  repo: GitHubRepoSummary | GitHubRepoDetail
  /** Per-repo language byte stats (from `getRepoLanguageStats`). */
  languages: LanguageStat[]
  tree: RepoTreeFile[]
}

export type RepoScorer = (
  input: RepoScoringInput,
  signal: JobSignal
) => RepoMatch

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function daysSince(isoDate: string, now = Date.now()): number {
  return Math.max(0, (now - Date.parse(isoDate)) / 86_400_000)
}
