import "server-only"

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"

/**
 * Password hashing built on Node's `scrypt`, which is a memory-hard KDF
 * designed for password storage.
 *
 * The parameters are encoded in the stored string, so they can be raised later
 * without invalidating existing hashes: `scrypt$N$r$p$<salt>$<hash>`.
 */

const KEY_LENGTH = 64
const SALT_LENGTH = 16
const N = 16_384
const R = 8
const P = 1
const PREFIX = "scrypt"
const MAX_MEMORY = 64 * 1024 * 1024

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password.normalize("NFKC"),
      salt,
      keyLength,
      { N, r: R, p: P, maxmem: MAX_MEMORY },
      (error, derivedKey) => {
        if (error) reject(error)
        else resolve(derivedKey)
      }
    )
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const key = await deriveKey(password, salt, KEY_LENGTH)
  return [PREFIX, N, R, P, salt.toString("base64"), key.toString("base64")].join(
    "$"
  )
}

/**
 * Verifies a password against a stored hash. Returns `false` for malformed
 * hashes rather than throwing, so a corrupt record can never crash a sign-in.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split("$")
  if (parts.length !== 6 || parts[0] !== PREFIX) return false

  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts
  const cost = Number.parseInt(nRaw, 10)
  const blockSize = Number.parseInt(rRaw, 10)
  const parallelization = Number.parseInt(pRaw, 10)
  if (!cost || !blockSize || !parallelization) return false

  let salt: Buffer
  let expected: Buffer
  try {
    salt = Buffer.from(saltRaw, "base64")
    expected = Buffer.from(hashRaw, "base64")
  } catch {
    return false
  }
  if (salt.length === 0 || expected.length === 0) return false

  const actual = await new Promise<Buffer>((resolve, reject) => {
    scryptCallback(
      password.normalize("NFKC"),
      salt,
      expected.length,
      { N: cost, r: blockSize, p: parallelization, maxmem: MAX_MEMORY },
      (error, derivedKey) => {
        if (error) reject(error)
        else resolve(derivedKey)
      }
    )
  })

  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}