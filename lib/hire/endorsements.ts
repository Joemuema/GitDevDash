import "server-only"

import { randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * Step 10 — merit endorsements store.
 *
 * Hirers can endorse a shortlisted developer with the role they hired/consider
 * for plus tags drawn from the JD's own languages/frameworks — no free text,
 * so counts stay meaningful. Developers see aggregate counts only: the store
 * never reveals *which* hirer endorsed *whom* outside the owning account.
 *
 * File-backed JSON (`.data/hire-endorsements.json`, `AUTH_HIRE_ENDORSEMENTS_PATH`
 * override) with the same atomic-write + promise-chain mutex pattern as the
 * account store (`lib/auth/user-store.ts`). One endorsement per account per
 * login — re-endorsing replaces the previous one.
 */

export type HireEndorsement = {
  id: string
  accountId: string
  login: string
  roleTag: string
  langTags: string[]
  createdAt: string
}

type Database = {
  version: 1
  endorsements: HireEndorsement[]
}

const EMPTY_DATABASE: Database = { version: 1, endorsements: [] }

const STORE_PATH =
  process.env.AUTH_HIRE_ENDORSEMENTS_PATH ??
  path.join(process.cwd(), ".data", "hire-endorsements.json")

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
      Array.isArray((parsed as Database).endorsements)
    ) {
      return { version: 1, endorsements: (parsed as Database).endorsements }
    }
    return EMPTY_DATABASE
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_DATABASE
    }
    console.error("[hire] Failed to read the endorsements store:", error)
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

const MAX_ROLE_TAG_LENGTH = 60
const MAX_TAGS = 8
const MAX_TAG_LENGTH = 40

function cleanTag(tag: string, max: number): string | null {
  const cleaned = tag.trim().slice(0, max)
  return cleaned ? cleaned : null
}

/**
 * Creates or replaces the calling account's endorsement for a login.
 * `allowedTags` is the JD's own languages + frameworks — anything outside it
 * is dropped so endorsement counts stay comparable.
 */
export async function upsertEndorsement(input: {
  accountId: string
  login: string
  roleTag: string
  langTags: string[]
  allowedTags: string[]
}): Promise<HireEndorsement> {
  const login = input.login.trim()
  const roleTag = cleanTag(input.roleTag, MAX_ROLE_TAG_LENGTH) ?? "Hire"
  const allowed = new Set(
    input.allowedTags.map((t) => t.trim().toLowerCase()).filter(Boolean)
  )
  const langTags = [
    ...new Set(
      input.langTags
        .map((t) => cleanTag(t, MAX_TAG_LENGTH))
        .filter((t): t is string => t !== null)
        .filter((t) => allowed.size === 0 || allowed.has(t.toLowerCase()))
    ),
  ].slice(0, MAX_TAGS)

  return withLock(async () => {
    const database = await readDatabase()
    const now = new Date().toISOString()
    const existing = database.endorsements.findIndex(
      (e) =>
        e.accountId === input.accountId &&
        e.login.toLowerCase() === login.toLowerCase()
    )
    if (existing !== -1) {
      const updated: HireEndorsement = {
        ...database.endorsements[existing],
        roleTag,
        langTags,
        createdAt: now,
      }
      const endorsements = [...database.endorsements]
      endorsements[existing] = updated
      await writeDatabase({ ...database, endorsements })
      return updated
    }
    const created: HireEndorsement = {
      id: randomUUID(),
      accountId: input.accountId,
      login,
      roleTag,
      langTags,
      createdAt: now,
    }
    await writeDatabase({
      ...database,
      endorsements: [...database.endorsements, created],
    })
    return created
  })
}

/** Removes the calling account's endorsement for a login (no-op if none). */
export async function removeEndorsement(
  accountId: string,
  login: string
): Promise<void> {
  await withLock(async () => {
    const database = await readDatabase()
    const key = login.trim().toLowerCase()
    const endorsements = database.endorsements.filter(
      (e) => !(e.accountId === accountId && e.login.toLowerCase() === key)
    )
    if (endorsements.length !== database.endorsements.length) {
      await writeDatabase({ ...database, endorsements })
    }
  })
}

/**
 * Aggregate counts safe to show publicly (developers see these): total
 * endorsements per login, with no account ids attached.
 */
export async function getEndorsementCounts(
  logins: string[]
): Promise<Record<string, number>> {
  const wanted = new Set(logins.map((l) => l.trim().toLowerCase()))
  const database = await readDatabase()
  const counts: Record<string, number> = {}
  for (const endorsement of database.endorsements) {
    if (!wanted.has(endorsement.login.toLowerCase())) continue
    counts[endorsement.login] = (counts[endorsement.login] ?? 0) + 1
  }
  return counts
}

/** The calling account's own endorsements for these logins (toggle state). */
export async function getOwnEndorsements(
  accountId: string,
  logins: string[]
): Promise<Record<string, HireEndorsement>> {
  const wanted = new Set(logins.map((l) => l.trim().toLowerCase()))
  const database = await readDatabase()
  const own: Record<string, HireEndorsement> = {}
  for (const endorsement of database.endorsements) {
    if (endorsement.accountId !== accountId) continue
    if (!wanted.has(endorsement.login.toLowerCase())) continue
    own[endorsement.login] = endorsement
  }
  return own
}
