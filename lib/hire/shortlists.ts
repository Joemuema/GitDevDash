import "server-only"

import { randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * Step 10 — named shortlists store.
 *
 * Lets a hirer save the current run (JD text + candidate logins + interview
 * notes) under a name for the interview handoff, then reload/rename/delete it
 * later. Per-account data: every operation is scoped by the owning account id.
 *
 * File-backed JSON (`.data/hire-shortlists.json`, `AUTH_HIRE_SHORTLISTS_PATH`
 * override), atomic temp-file writes, promise-chain mutex — the same pattern
 * as the account and endorsements stores.
 */

export type HireShortlist = {
  id: string
  accountId: string
  name: string
  jdText: string
  logins: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

type Database = {
  version: 1
  shortlists: HireShortlist[]
}

const EMPTY_DATABASE: Database = { version: 1, shortlists: [] }

const STORE_PATH =
  process.env.AUTH_HIRE_SHORTLISTS_PATH ??
  path.join(process.cwd(), ".data", "hire-shortlists.json")

const MAX_SHORTLISTS_PER_ACCOUNT = 20
const MAX_NAME_LENGTH = 80
const MAX_JD_CHARS = 20000
const MAX_LOGINS = 25
const MAX_NOTES_CHARS = 5000

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
      Array.isArray((parsed as Database).shortlists)
    ) {
      return { version: 1, shortlists: (parsed as Database).shortlists }
    }
    return EMPTY_DATABASE
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_DATABASE
    }
    console.error("[hire] Failed to read the shortlists store:", error)
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

/** All shortlists owned by an account, newest first. */
export async function listShortlists(
  accountId: string
): Promise<HireShortlist[]> {
  const database = await readDatabase()
  return database.shortlists
    .filter((s) => s.accountId === accountId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

/**
 * Saves the current run. Returns `{ ok: false }` when the account already
 * holds the per-account cap — the UI surfaces a "rename or delete one" hint.
 */
export async function createShortlist(input: {
  accountId: string
  name: string
  jdText: string
  logins: string[]
  notes?: string
}): Promise<{ ok: true; shortlist: HireShortlist } | { ok: false }> {
  const name = input.name.trim().slice(0, MAX_NAME_LENGTH)
  const jdText = input.jdText.slice(0, MAX_JD_CHARS)
  const logins = cleanLogins(input.logins)
  const notes = (input.notes ?? "").slice(0, MAX_NOTES_CHARS)
  if (!name || !jdText || logins.length === 0) {
    return { ok: false }
  }
  return withLock(async () => {
    const database = await readDatabase()
    const owned = database.shortlists.filter(
      (s) => s.accountId === input.accountId
    )
    if (owned.length >= MAX_SHORTLISTS_PER_ACCOUNT) return { ok: false }
    const now = new Date().toISOString()
    const shortlist: HireShortlist = {
      id: randomUUID(),
      accountId: input.accountId,
      name,
      jdText,
      logins,
      notes,
      createdAt: now,
      updatedAt: now,
    }
    await writeDatabase({
      ...database,
      shortlists: [...database.shortlists, shortlist],
    })
    return { ok: true, shortlist }
  })
}

/** Renames an owned shortlist (no-op shape when missing/not owned). */
export async function renameShortlist(
  accountId: string,
  id: string,
  name: string
): Promise<HireShortlist | null> {
  const cleaned = name.trim().slice(0, MAX_NAME_LENGTH)
  if (!cleaned) return null
  return withLock(async () => {
    const database = await readDatabase()
    const index = database.shortlists.findIndex(
      (s) => s.id === id && s.accountId === accountId
    )
    if (index === -1) return null
    const updated: HireShortlist = {
      ...database.shortlists[index],
      name: cleaned,
      updatedAt: new Date().toISOString(),
    }
    const shortlists = [...database.shortlists]
    shortlists[index] = updated
    await writeDatabase({ ...database, shortlists })
    return updated
  })
}

/** Updates notes on an owned shortlist. */
export async function updateShortlistNotes(
  accountId: string,
  id: string,
  notes: string
): Promise<HireShortlist | null> {
  return withLock(async () => {
    const database = await readDatabase()
    const index = database.shortlists.findIndex(
      (s) => s.id === id && s.accountId === accountId
    )
    if (index === -1) return null
    const updated: HireShortlist = {
      ...database.shortlists[index],
      notes: notes.slice(0, MAX_NOTES_CHARS),
      updatedAt: new Date().toISOString(),
    }
    const shortlists = [...database.shortlists]
    shortlists[index] = updated
    await writeDatabase({ ...database, shortlists })
    return updated
  })
}

/** Deletes an owned shortlist (no-op when missing/not owned). */
export async function deleteShortlist(
  accountId: string,
  id: string
): Promise<void> {
  await withLock(async () => {
    const database = await readDatabase()
    const shortlists = database.shortlists.filter(
      (s) => !(s.id === id && s.accountId === accountId)
    )
    if (shortlists.length !== database.shortlists.length) {
      await writeDatabase({ ...database, shortlists })
    }
  })
}

function cleanLogins(raw: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw) {
    const login = part.trim()
    if (!login) continue
    const key = login.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(login)
  }
  return out.slice(0, MAX_LOGINS)
}
