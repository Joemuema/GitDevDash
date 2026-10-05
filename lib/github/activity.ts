import { githubFetch } from "@/lib/github/client"
import type { ContributionPoint, DevActivity } from "@/lib/types/github"

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

const EVENTS_PER_PAGE = 100
/** GitHub only exposes ~90 days / 300 events of public activity. */
const MAX_EVENT_PAGES = 3
const DEFAULT_WINDOW_DAYS = 14

type ApiEvent = {
  type: string | null
  created_at: string | null
  payload?: { action?: string } | null
}

type ApiCommitSearch = {
  total_count?: number
  incomplete_results?: boolean
}

type DayBucket = { pushes: number; prs: number; issues: number }

const EMPTY_ACTIVITY: DevActivity = {
  points: [],
  windowDays: DEFAULT_WINDOW_DAYS,
  commits: null,
  pushes: 0,
  prs: 0,
  issues: 0,
}

/**
 * Builds a rolling view of a developer's public activity from
 * `/users/{username}/events/public`, plus an exact authored-commit count for
 * the same window from the commits search API.
 *
 * Two GitHub quirks shape this implementation:
 *  1. `PushEvent.payload` no longer carries `size` / `commits`, so pushes and
 *     commits are reported separately instead of being conflated.
 *  2. A single page of events is capped at 100, so a very active developer may
 *     only cover a few days. The window therefore shrinks to whatever the
 *     retrieved events actually span, and never exceeds `maxWindowDays`.
 */
export async function getUserActivity(
  username: string,
  maxWindowDays = DEFAULT_WINDOW_DAYS
): Promise<DevActivity> {
  const events = await fetchPublicEvents(username)
  if (events.length === 0) return EMPTY_ACTIVITY

  const newestIso = toIsoDate(new Date(events[0].created_at!))
  const oldestIso = toIsoDate(
    new Date(events[events.length - 1].created_at!)
  )
  const windowDays = clamp(
    diffDays(oldestIso, newestIso) + 1,
    1,
    maxWindowDays
  )

  // Anchor the window to the newest event so every retrieved event falls inside.
  const isoDays = buildIsoDayRange(newestIso, windowDays)
  const buckets = new Map<string, DayBucket>(
    isoDays.map((isoDate) => [isoDate, { pushes: 0, prs: 0, issues: 0 }])
  )

  for (const event of events) {
    if (!event.created_at) continue
    const bucket = buckets.get(toIsoDate(new Date(event.created_at)))
    if (!bucket) continue

    switch (event.type) {
      case "PushEvent":
        bucket.pushes += 1
        break
      case "PullRequestEvent":
        if (!event.payload?.action || event.payload.action === "opened") {
          bucket.prs += 1
        }
        break
      case "IssuesEvent":
        if (!event.payload?.action || event.payload.action === "opened") {
          bucket.issues += 1
        }
        break
    }
  }

  const points: ContributionPoint[] = isoDays.map((isoDate) => ({
    isoDate,
    date: monthDayLabel(isoDate),
    ...buckets.get(isoDate)!,
  }))

  const totals = points.reduce(
    (acc, point) => ({
      pushes: acc.pushes + point.pushes,
      prs: acc.prs + point.prs,
      issues: acc.issues + point.issues,
    }),
    { pushes: 0, prs: 0, issues: 0 }
  )

  return {
    points,
    windowDays,
    commits: await fetchCommitCount(username, isoDays[0]).catch(() => null),
    ...totals,
  }
}

/** Pulls up to `MAX_EVENT_PAGES` pages, stopping once the window is covered. */
async function fetchPublicEvents(username: string): Promise<ApiEvent[]> {
  const events: ApiEvent[] = []

  for (let page = 1; page <= MAX_EVENT_PAGES; page += 1) {
    const batch = await githubFetch<ApiEvent[]>(
      `/users/${encodeURIComponent(
        username
      )}/events/public?per_page=${EVENTS_PER_PAGE}&page=${page}`,
      { revalidate: 300 }
    )
    if (batch.length === 0) break

    events.push(...batch)

    const newest = events[0]?.created_at
    const oldest = events[events.length - 1]?.created_at
    if (
      batch.length < EVENTS_PER_PAGE ||
      (newest &&
        oldest &&
        diffDays(toIsoDate(new Date(oldest)), toIsoDate(new Date(newest))) + 1 >=
          DEFAULT_WINDOW_DAYS)
    ) {
      break
    }
  }

  return events.filter((event) => event.created_at)
}

/**
 * Exact authored-commit count via `/search/commits`. This uses a separate
 * (30 req/min) rate-limit bucket, so it cannot starve the core REST calls.
 * GitHub caps `total_count` around 1000 results per query.
 */
async function fetchCommitCount(
  username: string,
  sinceIsoDate: string
): Promise<number | null> {
  const q = `author:${username} committer-date:>${sinceIsoDate}`
  const data = await githubFetch<ApiCommitSearch>(
    `/search/commits?per_page=1&q=${encodeURIComponent(q)}`,
    { revalidate: 300 }
  )
  return typeof data.total_count === "number" ? data.total_count : null
}

function buildIsoDayRange(endIsoDate: string, days: number): string[] {
  const end = Date.parse(`${endIsoDate}T00:00:00Z`)
  const result: string[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    result.push(toIsoDate(new Date(end - offset * 86_400_000)))
  }
  return result
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function diffDays(fromIsoDate: string, toIsoDateValue: string): number {
  return Math.round(
    (Date.parse(`${toIsoDateValue}T00:00:00Z`) -
      Date.parse(`${fromIsoDate}T00:00:00Z`)) /
      86_400_000
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function monthDayLabel(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number)
  return `${MONTH_LABELS[month - 1]} ${day}`
}