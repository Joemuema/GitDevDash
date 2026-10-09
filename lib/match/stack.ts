import type { RepoTreeFile } from "@/lib/types/github"
import type { StackEvidence } from "@/lib/match/types"

/*
 * Framework/tool fingerprints derived from file-tree paths only (no blob
 * contents fetched). Names use the same normalised vocabulary as `JobSignal`
 * so JD skills and repo evidence compare 1:1.
 */

type Indicator = {
  match: (path: string, name: string) => boolean
  framework?: string
  tool?: string
}

const INDICATORS: Indicator[] = [
  { match: (p) => p === "package.json", framework: "node.js" },
  {
    match: (p) => /(^|\/)next\.config\.(js|mjs|ts)$/.test(p),
    framework: "next.js",
  },
  { match: (p) => /(^|\/)nuxt\.config\.(js|ts)$/.test(p), framework: "nuxt" },
  { match: (p) => p === "angular.json", framework: "angular" },
  { match: (p) => /(^|\/)vue\.config\.(js|mjs)$/.test(p), framework: "vue" },
  {
    match: (p) => /(^|\/)svelte\.config\.(js|ts)$/.test(p),
    framework: "svelte",
  },
  {
    match: (p, n) =>
      n === "requirements.txt" ||
      n === "pyproject.toml" ||
      n === "setup.py" ||
      n === "Pipfile",
  },
  { match: (p, n) => n === "manage.py", framework: "django" },
  { match: (p, n) => n === "Gemfile", framework: "rails" },
  { match: (p, n) => n === "composer.json", framework: "php" },
  { match: (p, n) => n === "go.mod", framework: "go" },
  { match: (p, n) => n === "Cargo.toml", framework: "rust" },
  {
    match: (p, n) =>
      n === "pom.xml" || n === "build.gradle" || n === "build.gradle.kts",
    framework: "java",
  },
  {
    match: (p, n) => /\.csproj$|\.sln$/.test(n),
    framework: "dotnet",
  },
  { match: (p, n) => n === "pubspec.yaml", framework: "flutter" },
  {
    match: (p, n) =>
      /(^|\/)dockerfile(\..*)?$/.test(p) ||
      n === "docker-compose.yml" ||
      n === "docker-compose.yaml",
    framework: "docker",
  },
  { match: (p, n) => /\.tf$/.test(n), framework: "terraform" },
  { match: (p, n) => n === "Chart.yaml", tool: "kubernetes" },
  { match: (p, n) => /\.ipynb$/.test(n), framework: "data science" },
  { match: (p) => p.startsWith(".github/workflows/"), tool: "ci/cd" },
]

function flatten(nodes: RepoTreeFile[]): { path: string; name: string }[] {
  const out: { path: string; name: string }[] = []
  const walk = (list: RepoTreeFile[]) => {
    for (const node of list) {
      if (node.type === "file") {
        const lower = node.path.toLowerCase()
        const segments = lower.split("/")
        out.push({ path: lower, name: segments[segments.length - 1] })
      } else if (node.children) {
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return out
}

export function fingerprintRepoTree(tree: RepoTreeFile[]): StackEvidence {
  const files = flatten(tree)
  const frameworks = new Set<string>()
  const tools = new Set<string>()

  let hasReadme = false
  let hasLicense = false
  let hasCI = false
  let hasTests = false
  let hasDockerfile = false

  for (const { path, name } of files) {
    if (/^readme(\..*)?$/.test(name) || path.endsWith("/readme.md"))
      hasReadme = true
    if (/^licen[sc]e(\..*)?$/.test(name) || /^copying(\..*)?$/.test(name))
      hasLicense = true
    if (
      /(^|\/)(__tests__|tests?|spec|e2e)\//.test(path) ||
      /\.(spec|test)\.[a-z]+$/.test(name)
    )
      hasTests = true

    for (const indicator of INDICATORS) {
      if (!indicator.match(path, name)) continue
      if (indicator.framework) frameworks.add(indicator.framework)
      if (indicator.tool) tools.add(indicator.tool)
      if (indicator.framework === "docker" || indicator.tool === "docker")
        hasDockerfile = true
      if (indicator.tool === "ci/cd") hasCI = true
    }
  }

  return {
    frameworks: [...frameworks].sort(),
    tools: [...tools].sort(),
    hasReadme,
    hasLicense,
    hasCI,
    hasTests,
    hasDockerfile,
  }
}
