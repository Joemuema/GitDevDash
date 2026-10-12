import "server-only"

import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * Step 11 — "who viewed you" impressions store.
 *
 * When a signed-in hirer views or scores a developer profile, one impression
 * per hirer/dev/day is recorded, tagged with the JD languages/frameworks that
 * led them there (when known). Developers see daily counts and tag
 * breakdowns — never *which* hirer looked.
 *
 * File-backed JSON (`.data/grow-impressions.json`, `AUTH_GROW_IMPRESSIONS_PATH`
 * override), atomic temp-file writes, promise-chain mutex — same pattern as
 * the sibling stores. Anti-gaming is structural: the dedupe key includes the
 * UTC date, so refreshing a profile all day still counts once.
 */

export type ImpressionSummary = {
  /** Views in the trailing 7 UTC days (today + 6 back). */
  last7Days: number
  /** Views in the trailing 30 UTC days, bucketed per day (oldest first). */
  daily: Array<{ date: string; views: number }>
  /** JD tags that led hirers here, most common first. */
  topTags: Array<{ name: string; count: number }>
}

type DayRecord = {
  viewers: string[]
  tags: Record<string, number>
}

type Database = {
  version: 1
  /** login-lowercased -> YYYY-MM-DD -> record */
  impressions: Record<string, Record<string, DayRecord>>
}

const EMPTY_DATABASE: Database = { version: 1, impressions: {} }

const STORE_PATH =
  process.env.AUTH_GROW_IMPRESSIONS_PATH ??
  path.join(process.cwd(), ".data", "grow-impressions.json")

const MAX_DAYS_PER_LOGIN = 90
const MAX_TAGS = 10

let writeQueue: Promise<unknown> = Promise.resolve()

function withLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation)
  writeQueue = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

function isDayRecord(value: unknown): value is DayRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as DayRecord).viewers) &&
    typeof (value as DayRecord).tags === "object"
  )
}

async function readDatabase(): Promise<Database> {
  try {
    const raw = await readFile(/* turbopackIgnore: true */ STORE_PATH, "utf8")
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Database).impressions === "object"
    ) {
      return { version: 1, impressions: (parsed as Database).impressions }
    }
    return EMPTY_DATABASE
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_DATABASE
    }
    console.error("[grow] Failed to read the impressions store:", error)
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

/**
 * Records a hirer viewing a developer. `viewerId` is the hirer's account id
 * (dedupe key only — never surfaced); `tags` are the JD languages/frameworks
 * behind the visit, when known.
 */
export async function recordImpression(input: {
  viewerId: string
  login: string
  tags?: string[]
}): Promise<void> {
  const login = input.login.trim().toLowerCase()
  const viewer = input.viewerId.trim()
  if (!login || !viewer) return
  const day = todayUtc()
  const tags = [...new Set((input.tags ?? []).map((t) => t.trim()))]
    .filter(Boolean)
    .slice(0, MAX_TAGS)

  await withLock(async () => {
    const database = await readDatabase()
    const perLogin = database.impressions[login] ?? {}
    const record: DayRecord = isDayRecord(perLogin[day])
      ? perLogin[day]
      : { viewers: [], tags: {} }
    if (!record.viewers.includes(viewer)) {
      record.viewers.push(viewer)
    }
    for (const tag of tags) {
      record.tags[tag] = (record.tags[tag] ?? 0) + 1
    }
    const days = { ...perLogin, [day]: record }
    const sorted = Object.keys(days).sort()
    while (sorted.length > MAX_DAYS_PER_LOGIN) {
      const oldest = sorted.shift()
      if (oldest) delete days[oldest]
    }
    database.impressions[login] = days
    await writeDatabase(database)
  })
}

/** Public summary for a developer: counts + tag breakdown, no identities. */
export async function getImpressionSummary(
  login: string
): Promise<ImpressionSummary> {
  const database = await readDatabase()
  const perLogin = database.impressions[login.trim().toLowerCase()] ?? {}
  const dates: string[] = []
  const now = new Date(`${todayUtc()}T00:00:00Z`).getTime()
  for (let back = 29; back >= 0; back -= 1) {
    const date = new Date(now - back * 86_400_000).toISOString().slice(0, 10)
    dates.push(date)
  }
  const daily = dates.map((date) => ({
    date,
    views: isDayRecord(perLogin[date]) ? perLogin[date].viewers.length : 0,
  }))
  const last7Days = daily
    .slice(-7)
    .reduce((sum, bucket) => sum + bucket.views, 0)
  const tagTotals: Record<string, number> = {}
  for (const bucket of Object.values(perLogin)) {
    if (!isDayRecord(bucket)) continue
    for (const [tag, count] of Object.entries(bucket.tags)) {
      tagTotals[tag] = (tagTotals[tag] ?? 0) + count
    }
  }
  const topTags = Object.entries(tagTotals)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, MAX_TAGS)
  return { last7Days, daily, topTags }
}
