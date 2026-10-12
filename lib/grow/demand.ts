import "server-only"

import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * Step 11 — demand radar store: anonymized aggregates of parsed JDs.
 *
 * Counts only — which languages/frameworks hirers search for and how often.
 * No hirer identity, no JD text, no timestamps per event. Developers see
 * "TypeScript appears in 42 searches" — never *who* searched it.
 *
 * File-backed JSON (`.data/grow-demand.json`, `AUTH_GROW_DEMAND_PATH`
 * override), atomic temp-file writes, promise-chain mutex — the same pattern
 * as the account and hire stores.
 */

export type DemandSnapshot = {
  languages: Array<{ name: string; count: number }>
  frameworks: Array<{ name: string; count: number }>
  totalJds: number
}

type Database = {
  version: 1
  totalJds: number
  languages: Record<string, number>
  frameworks: Record<string, number>
}

const EMPTY_DATABASE: Database = {
  version: 1,
  totalJds: 0,
  languages: {},
  frameworks: {},
}

const STORE_PATH =
  process.env.AUTH_GROW_DEMAND_PATH ??
  path.join(process.cwd(), ".data", "grow-demand.json")

let writeQueue: Promise<unknown> = Promise.resolve()

function withLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation)
  writeQueue = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

async function readDatabase(): Promise<Database> {
  try {
    const raw = await readFile(/* turbopackIgnore: true */ STORE_PATH, "utf8")
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Database).totalJds === "number" &&
      typeof (parsed as Database).languages === "object" &&
      typeof (parsed as Database).frameworks === "object"
    ) {
      const db = parsed as Database
      return {
        version: 1,
        totalJds: db.totalJds,
        languages: db.languages ?? {},
        frameworks: db.frameworks ?? {},
      }
    }
    return EMPTY_DATABASE
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_DATABASE
    }
    console.error("[grow] Failed to read the demand store:", error)
    return EMPTY_DATABASE
  }
}

async function writeDatabase(database: Database): Promise<void> {
  const temporaryPath = `${STORE_PATH}.${process.pid}.tmp`
  await mkdir(/* turbopackIgnore: true */ path.dirname(STORE_PATH), {
    recursive: true,
  })
  await writeFile(
    /* turbopackIgnore: true */ temporaryPath,
    `${JSON.stringify(database, null, 2)}\n`,
    "utf8"
  )
  await rename(/* turbopackIgnore: true */ temporaryPath, STORE_PATH)
}

function topEntries(
  counts: Record<string, number>,
  limit: number
): Array<{ name: string; count: number }> {
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

/**
 * Records one parsed JD: bumps the JD counter and each distinct
 * language/framework it mentions (once per JD, so a keyword-stuffed
 * description can't skew the radar).
 */
export async function recordDemand(
  languages: string[],
  frameworks: string[]
): Promise<void> {
  const langs = [...new Set(languages.map((l) => l.trim()).filter(Boolean))]
  const frameworks_ = [
    ...new Set(frameworks.map((f) => f.trim()).filter(Boolean)),
  ]
  if (langs.length === 0 && frameworks_.length === 0) return
  await withLock(async () => {
    const database = await readDatabase()
    for (const lang of langs) {
      database.languages[lang] = (database.languages[lang] ?? 0) + 1
    }
    for (const fw of frameworks_) {
      database.frameworks[fw] = (database.frameworks[fw] ?? 0) + 1
    }
    database.totalJds += 1
    await writeDatabase(database)
  })
}

/** Public snapshot for the developer radar (counts only). */
export async function getDemandSnapshot(limit = 10): Promise<DemandSnapshot> {
  const database = await readDatabase()
  return {
    languages: topEntries(database.languages, limit),
    frameworks: topEntries(database.frameworks, limit),
    totalJds: database.totalJds,
  }
}
