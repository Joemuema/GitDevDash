import { githubFetch } from "@/lib/github/client"
import type { RepoTreeFile } from "@/lib/types/github"

/** Guards against pathological repos (e.g. vendored dependency trees). */
const MAX_TREE_ENTRIES = 2000

type ApiTreeEntry = {
  path: string
  mode: string
  type: "blob" | "tree" | "commit"
  sha: string
  size?: number
  url: string
}

export type RepoTreeResult = {
  files: RepoTreeFile[]
  truncated: boolean
  fileCount: number
}

/**
 * Fetches the full recursive file tree for a branch in a single request via the
 * GitHub Git Trees API (`/git/trees/{branch}?recursive=1`).
 */
export async function getRepoTree(
  username: string,
  repo: string,
  branch: string
): Promise<RepoTreeResult> {
  const data = await githubFetch<{
    tree?: ApiTreeEntry[]
    truncated?: boolean
  }>(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(
      repo
    )}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { revalidate: 600 }
  )

  // The root entry comes back with an empty path; it is the container we build.
  const entries = (data.tree ?? []).filter((entry) => entry.path)
  const limited = entries.slice(0, MAX_TREE_ENTRIES)

  return {
    files: buildFileTree(limited),
    truncated: Boolean(data.truncated) || entries.length > MAX_TREE_ENTRIES,
    fileCount: limited.filter((entry) => entry.type === "blob").length,
  }
}

/**
 * Converts the flat, path-sorted tree returned by GitHub into the nested
 * structure the explorer renders. Sorting by path guarantees a directory is
 * always seen before its children, so ancestors can be created on demand.
 */
function buildFileTree(entries: ApiTreeEntry[]): RepoTreeFile[] {
  const root: RepoTreeFile = {
    id: "",
    name: "",
    type: "folder",
    path: "",
    size: null,
    children: [],
  }
  const folders = new Map<string, RepoTreeFile>([["", root]])

  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path))

  for (const entry of sorted) {
    const segments = entry.path.split("/")
    const name = segments[segments.length - 1]
    const parentPath = segments.slice(0, -1).join("/")

    if (entry.type === "tree") {
      ensureFolder(entry.path, folders, root)
      continue
    }

    const parent = ensureFolder(parentPath, folders, root)
    parent.children?.push({
      id: entry.path,
      name,
      type: "file",
      path: entry.path,
      size: typeof entry.size === "number" ? entry.size : null,
    })
  }

  sortChildren(root)
  return root.children ?? []
}

function ensureFolder(
  path: string,
  folders: Map<string, RepoTreeFile>,
  root: RepoTreeFile
): RepoTreeFile {
  if (path === "") return root

  const existing = folders.get(path)
  if (existing) return existing

  const segments = path.split("/")
  const name = segments[segments.length - 1]
  const parentPath = segments.slice(0, -1).join("/")
  const parent = ensureFolder(parentPath, folders, root)

  const node: RepoTreeFile = {
    id: path,
    name,
    type: "folder",
    path,
    size: null,
    children: [],
  }
  parent.children?.push(node)
  folders.set(path, node)
  return node
}

function sortChildren(node: RepoTreeFile) {
  if (!node.children) return
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  for (const child of node.children) sortChildren(child)
}