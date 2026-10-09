import type {
  DevActivity,
  GitHubRepoDetail,
  GitHubRepoSummary,
  LanguageStat,
} from "@/lib/types/github"
import {
  DIMENSION_WEIGHTS,
  type DimensionScore,
  type JobSignal,
  type StackEvidence,
} from "@/lib/match/types"
import { clampScore, daysSince } from "@/lib/match/scoring"

function languageShare(
  languages: LanguageStat[],
  names: string[]
): { share: number; matched: string[] } {
  const wanted = new Set(names.map((n) => n.toLowerCase()))
  let share = 0
  const matched: string[] = []
  for (const stat of languages) {
    if (wanted.has(stat.name.toLowerCase())) {
      share += stat.percentage
      matched.push(stat.name)
    }
  }
  return { share, matched }
}

export function scoreLanguageDimension(
  languages: LanguageStat[],
  signal: JobSignal
): DimensionScore {
  const evidence: { label: string; detail: string }[] = []
  const required = signal.requiredLanguages
  if (required.length === 0) {
    return {
      key: "language",
      score: 50,
      weight: DIMENSION_WEIGHTS.language,
      evidence: [
        {
          label: "No language requirements",
          detail: "The job description names no languages, so this is neutral.",
        },
      ],
    }
  }

  const { share, matched } = languageShare(languages, required)
  const score = share >= 60 ? 100 : share >= 35 ? 75 : share > 0 ? 45 : 0
  evidence.push({
    label:
      matched.length > 0
        ? `Matched: ${matched.join(", ")}`
        : "No required language detected",
    detail: `${Math.round(share)}% of bytes in the sampled code are in required languages.`,
  })

  if (score === 0 && signal.niceToHaveLanguages.length > 0) {
    const nice = languageShare(languages, signal.niceToHaveLanguages)
    if (nice.share > 0) {
      evidence.push({
        label: `Nice-to-have: ${nice.matched.join(", ")}`,
        detail: `${Math.round(nice.share)}% of bytes match nice-to-have languages. Partial credit applied.`,
      })
      return {
        key: "language",
        score: 30,
        weight: DIMENSION_WEIGHTS.language,
        evidence,
      }
    }
  }

  return {
    key: "language",
    score,
    weight: DIMENSION_WEIGHTS.language,
    evidence,
  }
}

export function scoreStackDimension(
  stack: StackEvidence,
  signal: JobSignal
): DimensionScore {
  const evidence: { label: string; detail: string }[] = []
  const required = signal.requiredFrameworks
  const found = new Set([...stack.frameworks, ...stack.tools])

  if (stack.frameworks.length > 0 || stack.tools.length > 0) {
    evidence.push({
      label: "Detected in file tree",
      detail: [...stack.frameworks, ...stack.tools].join(", "),
    })
  }

  if (required.length === 0) {
    return {
      key: "stack",
      score: found.size > 0 ? 60 : 50,
      weight: DIMENSION_WEIGHTS.stack,
      evidence: [
        ...evidence,
        {
          label: "No framework requirements",
          detail:
            "The job description names no frameworks, so this is near-neutral.",
        },
      ],
    }
  }

  const hits = required.filter((f) => found.has(f.toLowerCase()))
  const score = clampScore((hits.length / required.length) * 100)
  evidence.push({
    label:
      hits.length > 0
        ? `Matched ${hits.length}/${required.length}: ${hits.join(", ")}`
        : `None of ${required.length} required frameworks detected`,
    detail:
      hits.length > 0
        ? "Evidence comes from config/manifest filenames in the repo tree."
        : `Looked for: ${required.join(", ")}.`,
  })
  return { key: "stack", score, weight: DIMENSION_WEIGHTS.stack, evidence }
}

function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#\s-]/g, " ")
    .split(/[\s,;|/()[\]{}:]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2)
}

export function scoreRelevanceDimension(
  name: string,
  description: string | null,
  signal: JobSignal
): DimensionScore {
  if (signal.keywords.length === 0) {
    return {
      key: "relevance",
      score: 50,
      weight: DIMENSION_WEIGHTS.relevance,
      evidence: [
        {
          label: "No distinctive keywords",
          detail: "Nothing salient to overlap against, so this is neutral.",
        },
      ],
    }
  }

  const haystack = new Set(tokenizeText(`${name} ${description ?? ""}`))
  const hits = signal.keywords.filter((k) => haystack.has(k.toLowerCase()))
  const denom = Math.min(signal.keywords.length, 5)
  const score = clampScore((hits.length / denom) * 100)
  return {
    key: "relevance",
    score,
    weight: DIMENSION_WEIGHTS.relevance,
    evidence: [
      {
        label:
          hits.length > 0
            ? `Keyword overlap: ${hits.join(", ")}`
            : "No keyword overlap",
        detail: "Compared repo name + description against JD keywords.",
      },
    ],
  }
}

export function scoreQualityDimension(
  repo: GitHubRepoSummary | GitHubRepoDetail,
  stack: StackEvidence
): DimensionScore {
  const evidence = []
  let score = 0

  // Community traction, log-scaled so 1000 stars saturates.
  const starScore = clampScore((Math.log10(repo.stargazersCount + 1) / 3) * 100)
  score += starScore * 0.4
  evidence.push({
    label: `${repo.stargazersCount.toLocaleString()} stars, ${repo.forksCount.toLocaleString()} forks`,
    detail: `Traction sub-score ${starScore}/100 (log-scaled).`,
  })

  // Recency of maintenance.
  const age = daysSince(repo.updatedAt)
  const recency = age <= 90 ? 100 : age <= 365 ? 70 : age <= 730 ? 40 : 15
  score += recency * 0.3
  evidence.push({
    label:
      age <= 90
        ? "Maintained recently"
        : age <= 365
          ? "Updated in the last year"
          : "Stale",
    detail: `Last updated ${Math.round(age)} days ago (recency sub-score ${recency}/100).`,
  })

  // Hygiene: docs + license + tests + CI.
  let hygiene = 0
  if (stack.hasReadme) hygiene += 40
  if (stack.hasLicense) hygiene += 30
  if (stack.hasTests) hygiene += 20
  if (stack.hasCI) hygiene += 10
  score += Math.min(100, hygiene) * 0.2
  const missing: string[] = []
  if (!stack.hasReadme) missing.push("README")
  if (!stack.hasLicense) missing.push("LICENSE")
  if (!stack.hasTests) missing.push("tests")
  if (!stack.hasCI) missing.push("CI")
  evidence.push({
    label:
      missing.length === 0
        ? "Full hygiene: README, LICENSE, tests, CI"
        : `Missing: ${missing.join(", ")}`,
    detail: `Hygiene sub-score ${Math.min(100, hygiene)}/100.`,
  })

  // Open-issue load (repo detail only).
  if ("openIssuesCount" in repo) {
    const ratio = repo.openIssuesCount / (repo.stargazersCount + 10)
    const issueScore = ratio < 0.05 ? 100 : ratio < 0.2 ? 70 : 40
    score += issueScore * 0.1
    evidence.push({
      label: `${repo.openIssuesCount} open issues`,
      detail: `Issue-load sub-score ${issueScore}/100.`,
    })
  } else {
    score += 50 * 0.1
  }

  return {
    key: "quality",
    score: clampScore(score),
    weight: DIMENSION_WEIGHTS.quality,
    evidence,
  }
}

export function scoreActivityDimension(
  activity: DevActivity | null
): DimensionScore {
  if (!activity) {
    return {
      key: "activity",
      score: 0,
      weight: DIMENSION_WEIGHTS.activity,
      evidence: [
        {
          label: "No activity data",
          detail:
            "Public events were unavailable, so this scores zero rather than guessing.",
        },
      ],
    }
  }
  const raw =
    activity.pushes * 8 +
    activity.prs * 15 +
    activity.issues * 10 +
    Math.min(activity.commits ?? 0, 50)
  const score = clampScore((raw / 300) * 100)
  return {
    key: "activity",
    score,
    weight: DIMENSION_WEIGHTS.activity,
    evidence: [
      {
        label: `${activity.pushes} pushes · ${activity.prs} PRs · ${activity.issues} issues`,
        detail: `Over the last ${activity.windowDays} days${activity.commits != null ? `, ${activity.commits} authored commits` : ""}.`,
      },
    ],
  }
}
