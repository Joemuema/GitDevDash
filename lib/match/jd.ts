import type { JobSignal, Seniority } from "@/lib/match/types"

/*
 * Deterministic job-description parser. Vocabulary is intentionally explicit
 * (no ML dependency) so parsing is free, offline-capable and testable.
 */

const KNOWN_LANGUAGES = new Set([
  "typescript",
  "javascript",
  "python",
  "java",
  "go",
  "rust",
  "ruby",
  "php",
  "c#",
  "c++",
  "swift",
  "kotlin",
  "scala",
  "dart",
  "elixir",
  "haskell",
  "shell",
  "sql",
  "html",
  "css",
])

const KNOWN_FRAMEWORKS = new Set([
  "react",
  "react native",
  "next.js",
  "vue",
  "nuxt",
  "angular",
  "svelte",
  "node.js",
  "express",
  "fastify",
  "django",
  "flask",
  "fastapi",
  "rails",
  "laravel",
  "spring",
  "dotnet",
  ".net",
  "tensorflow",
  "pytorch",
  "pandas",
  "flutter",
  "docker",
  "kubernetes",
  "terraform",
  "ansible",
  "graphql",
  "rest",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "kafka",
  "spark",
  "airflow",
  "aws",
  "gcp",
  "azure",
  "ci/cd",
  "machine learning",
  "data science",
])

/** Unambiguous shorthand aliases. Deliberately excludes clashers like `tf`. */
const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  golang: "go",
  k8s: "kubernetes",
  postgres: "postgresql",
  nodejs: "node.js",
  next: "next.js",
  nextjs: "next.js",
}

const STOPWORDS = new Set(
  "a,an,the,and,or,but,of,for,with,to,in,on,at,by,from,as,is,are,was,were,be,been,being,have,has,had,do,does,did,will,would,can,could,should,may,might,must,shall,we,you,they,our,your,their,this,that,these,those,it,its,into,over,under,between,through,during,about,who,whom,which,what,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,just,also,including,include,includes,required,requirements,skills,experience,years,year,plus,bonus,basic,strong,good,excellent,ability,work,working,team,candidate,role,job,join,looking,seeking,help,build,building,maintain,develop,development,design,ensure,knowledge,understanding,passion,passionate,fast,paced,growing,opportunity".split(
    ","
  )
)

const NICE_TO_HAVE_RE =
  /nice.to.have|bonus|nice to|a plus|\bplus\b|preferred|familiarity|ideally/i

function normaliseToken(raw: string): string {
  const token = raw.toLowerCase().trim()
  if (!token) return ""
  if (ALIASES[token]) return ALIASES[token]
  return token
}

/** Splits text into clean single-word tokens, preserving `c++`, `c#`, `ci/cd`. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#/.\s-]/g, " ")
    .split(/[\s,;|/()[\]{}:]+/)
    .map((t) => t.trim().replace(/^[.-]+|[.-]+$/g, ""))
    .filter(Boolean)
    .map(normaliseToken)
    .filter(Boolean)
}

/** Multi-word skills that single-token matching would miss. */
function findPhrases(text: string): string[] {
  const lower = ` ${text.toLowerCase()} `
  const found: string[] = []
  for (const phrase of ["react native", "machine learning", "data science"]) {
    if (lower.includes(phrase)) found.push(phrase)
  }
  if (lower.includes(".net") && !found.includes("dotnet")) found.push("dotnet")
  return found
}

function detectSeniority(text: string): Seniority {
  const lower = text.toLowerCase()
  if (/\bsenior\b|\bstaff\b|\bprincipal\b|\blead\b|\barchitect\b/.test(lower))
    return "senior"
  if (/\bjunior\b|\bentry\b|\bintern\b|\bgraduate\b|\btrainee\b/.test(lower))
    return "junior"
  if (/\bmid[\s-]?level\b|\bmid\b|\bintermediate\b/.test(lower)) return "mid"
  return "any"
}

function pushUnique(list: string[], value: string) {
  if (!list.includes(value)) list.push(value)
}

export function parseJobDescription(rawText: string): JobSignal {
  const text = rawText ?? ""
  const firstLine = text.split("\n").find((line) => line.trim()) ?? ""

  const requiredLanguages: string[] = []
  const niceToHaveLanguages: string[] = []
  const requiredFrameworks: string[] = []
  const niceToHaveFrameworks: string[] = []
  const keywordCounts = new Map<string, number>()

  const sentences = text.split(/[.\n;]+/)
  for (const sentence of sentences) {
    const nice = NICE_TO_HAVE_RE.test(sentence)
    for (const token of tokenize(sentence)) {
      if (KNOWN_LANGUAGES.has(token)) {
        pushUnique(nice ? niceToHaveLanguages : requiredLanguages, token)
        continue
      }
      if (KNOWN_FRAMEWORKS.has(token)) {
        pushUnique(nice ? niceToHaveFrameworks : requiredFrameworks, token)
        continue
      }
      if (!STOPWORDS.has(token) && token.length > 2 && !/^\d+$/.test(token)) {
        keywordCounts.set(token, (keywordCounts.get(token) ?? 0) + 1)
      }
    }
    for (const phrase of findPhrases(sentence)) {
      pushUnique(nice ? niceToHaveFrameworks : requiredFrameworks, phrase)
    }
  }

  const skillTokens = new Set([
    ...requiredLanguages,
    ...niceToHaveLanguages,
    ...requiredFrameworks,
    ...niceToHaveFrameworks,
  ])
  const keywords = [...keywordCounts.entries()]
    .filter(([word]) => !skillTokens.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word)

  return {
    title: firstLine.trim().slice(0, 80) || null,
    requiredLanguages,
    niceToHaveLanguages,
    requiredFrameworks,
    niceToHaveFrameworks,
    keywords,
    seniority: detectSeniority(text),
    rawText: text,
  }
}
