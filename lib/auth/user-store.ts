import "server-only"

import { randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

import type { AuthProvider, SessionUser } from "@/lib/auth/types"

/**
 * Account persistence.
 *
 * GitDevDash is a local-first dashboard with no database dependency, so accounts
 * are stored as a JSON document on disk. Everything here sits behind this module
 * so swapping in a real database later means rewriting one file, not the actions
 * or the UI.
 *
 * Durability notes:
 * - Writes go to a temp file and are then renamed, so a crash mid-write can never
 *   leave a truncated file behind (rename is atomic on the same filesystem).
 * - All mutations are funnelled through a promise-chain mutex, so two concurrent
 *   server actions can't clobber each other's changes.
 */

export type StoredUser = {
  id: string
  name: string
  email: string
  provider: AuthProvider
  image: string | null
  /** Absent for Google-only accounts, which never set a local password. */
  passwordHash: string | null
  /** Bumped on password change to invalidate other outstanding sessions. */
  sessionVersion: number
  createdAt: string
  updatedAt: string
}

type Database = {
  version: 1
  users: StoredUser[]
}

const EMPTY_DATABASE: Database = { version: 1, users: [] }

/**
 * Where accounts are persisted: `AUTH_STORE_PATH`, or `<cwd>/.data/users.json`.
 *
 * The path is derived at runtime (an env var and `process.cwd()`), so the
 * bundler's file tracer can't resolve it. Every filesystem call below therefore
 * carries a `turbopackIgnore` comment — the idiom Next.js itself uses for
 * runtime paths. Without it the tracer assumes the whole project is reachable
 * and copies all of it into the server output.
 */
const STORE_PATH =
  process.env.AUTH_STORE_PATH ??
  path.join(process.cwd(), ".data", "users.json")

/** Serialises every read-modify-write cycle against a single promise chain. */
let writeQueue: Promise<unknown> = Promise.resolve()

function withLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation)
  // Keep the chain alive even when an operation rejects.
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
      Array.isArray((parsed as Database).users)
    ) {
      return { version: 1, users: (parsed as Database).users }
    }
    return EMPTY_DATABASE
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_DATABASE
    }
    // A corrupt store should not take the whole app down — surface it and start
    // from a clean slate so sign-up still works.
    console.error("[auth] Failed to read the account store:", error)
    return EMPTY_DATABASE
  }
}

async function writeDatabase(database: Database): Promise<void> {
  await mkdir(/* turbopackIgnore: true */ path.dirname(STORE_PATH), {
    recursive: true,
  })
  const temporaryPath = `${STORE_PATH}.${process.pid}.tmp`
  await writeFile(
    /* turbopackIgnore: true */ temporaryPath,
    `${JSON.stringify(database, null, 2)}\n`,
    "utf8"
  )
  await rename(/* turbopackIgnore: true */ temporaryPath, STORE_PATH)
}

/** Emails are matched case-insensitively, so always compare normalised values. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function toSessionUser(user: StoredUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    image: user.image,
    createdAt: user.createdAt,
  }
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const database = await readDatabase()
  return database.users.find((user) => user.id === id) ?? null
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = normalizeEmail(email)
  const database = await readDatabase()
  return database.users.find((user) => user.email === normalized) ?? null
}

export type CreateUserInput = {
  name: string
  email: string
  provider: AuthProvider
  passwordHash?: string | null
  image?: string | null
}

/**
 * Inserts a user, refusing to create a duplicate for an email that already
 * exists. The check runs inside the lock so a double-submitted form can't race
 * its way past it.
 */
export async function createUser(
  input: CreateUserInput
): Promise<{ ok: true; user: StoredUser } | { ok: false; reason: "duplicate" }> {
  return withLock(async () => {
    const database = await readDatabase()
    const email = normalizeEmail(input.email)

    if (database.users.some((user) => user.email === email)) {
      return { ok: false, reason: "duplicate" } as const
    }

    const now = new Date().toISOString()
    const user: StoredUser = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      provider: input.provider,
      image: input.image ?? null,
      passwordHash: input.passwordHash ?? null,
      sessionVersion: 1,
      createdAt: now,
      updatedAt: now,
    }

    await writeDatabase({ ...database, users: [...database.users, user] })
    return { ok: true, user } as const
  })
}

/**
 * Applies a partial update. `id`, `email` and `createdAt` are intentionally not
 * patchable here.
 */
export async function updateUser(
  id: string,
  changes: Partial<
    Pick<StoredUser, "name" | "image" | "passwordHash" | "sessionVersion">
  >
): Promise<StoredUser | null> {
  return withLock(async () => {
    const database = await readDatabase()
    const index = database.users.findIndex((user) => user.id === id)
    if (index === -1) return null

    const updated: StoredUser = {
      ...database.users[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    }

    const users = [...database.users]
    users[index] = updated
    await writeDatabase({ ...database, users })
    return updated
  })
}