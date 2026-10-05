"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUserRecord } from "@/lib/auth/dal"
import type { AuthFormState } from "@/lib/auth/form-state"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { createSession, deleteSession } from "@/lib/auth/session"
import { createUser, findUserByEmail, updateUser } from "@/lib/auth/user-store"

/**
 * Authentication Server Actions.
 *
 * Accounts live in the JSON store at `lib/auth/user-store.ts`. Signing in issues
 * an encrypted JWT cookie, and every action revalidates the layout so that
 * server-rendered UI picks up the new auth state immediately.
 *
 * Note: this is a `"use server"` module, so it may only export async functions.
 * Shared types and the initial form state live in `lib/auth/form-state.ts`.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

/**
 * Used for both "no such account" and "wrong password" so the form can't be used
 * to enumerate which email addresses are registered.
 */
const GENERIC_CREDENTIALS_ERROR =
  "That email and password combination doesn't match an account."

const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again."

function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

/**
 * A checkbox is simply absent from `FormData` when unchecked, so an absent value
 * means "off" rather than "fall back to the default".
 */
function readCheckbox(formData: FormData, key: string): boolean {
  const value = formData.get(key)
  if (value === null) return false
  return value !== "off" && value !== "false" && value !== "0"
}

function validateCredentials(
  email: string,
  password: string
): AuthFormState | null {
  if (!email) {
    return { status: "error", message: "Enter your email address." }
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "That doesn't look like a valid email." }
  }
  if (!password) {
    return { status: "error", message: "Enter your password." }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      status: "error",
      message: `Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }
  }
  return null
}

export async function signInWithEmail(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = readField(formData, "email")
  const password = String(formData.get("password") ?? "")
  const remember = readCheckbox(formData, "remember")

  const invalid = validateCredentials(email, password)
  if (invalid) return invalid

  const user = await findUserByEmail(email)
  if (!user || !user.passwordHash) {
    return { status: "error", message: GENERIC_CREDENTIALS_ERROR }
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash)
  if (!passwordMatches) {
    return { status: "error", message: GENERIC_CREDENTIALS_ERROR }
  }

  await createSession(user.id, user.email, {
    remember,
    sessionVersion: user.sessionVersion,
  })
  revalidatePath("/", "layout")

  return { status: "success", message: `Welcome back, ${user.name}.` }
}

export async function registerAccount(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = readField(formData, "name")
  const email = readField(formData, "email")
  const password = String(formData.get("password") ?? "")
  const remember = readCheckbox(formData, "remember")

  if (name.length < 2) {
    return { status: "error", message: "Enter your name." }
  }

  const invalid = validateCredentials(email, password)
  if (invalid) return invalid

  const passwordHash = await hashPassword(password)
  const created = await createUser({
    name,
    email,
    provider: "email",
    passwordHash,
  })

  if (!created.ok) {
    return {
      status: "error",
      message:
        "An account with that email already exists. Sign in instead, or use a different address.",
    }
  }

  await createSession(created.user.id, created.user.email, {
    remember,
    sessionVersion: created.user.sessionVersion,
  })
  revalidatePath("/", "layout")

  return {
    status: "success",
    message: `Welcome to GitDevDash, ${created.user.name}.`,
  }
}

export async function signOut(): Promise<AuthFormState> {
  await deleteSession()
  revalidatePath("/", "layout")
  return { status: "success", message: "You've been signed out." }
}

export async function updateProfile(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const current = await getCurrentUserRecord()
  if (!current) {
    return { status: "error", message: SESSION_EXPIRED_MESSAGE }
  }

  const name = readField(formData, "name")
  if (name.length < 2) {
    return { status: "error", message: "Enter your name." }
  }
  if (name === current.name) {
    return { status: "info", message: "That's already your display name." }
  }

  const updated = await updateUser(current.id, { name })
  if (!updated) {
    return { status: "error", message: "We couldn't update your profile." }
  }

  revalidatePath("/", "layout")
  return { status: "success", message: "Your profile has been updated." }
}

export async function changePassword(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const current = await getCurrentUserRecord()
  if (!current) {
    return { status: "error", message: SESSION_EXPIRED_MESSAGE }
  }
  if (!current.passwordHash) {
    return {
      status: "info",
      message:
        "This account signs in with Google, so it doesn't have a password to change.",
    }
  }

  const currentPassword = String(formData.get("currentPassword") ?? "")
  const newPassword = String(formData.get("newPassword") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  if (!currentPassword) {
    return { status: "error", message: "Enter your current password." }
  }

  const passwordMatches = await verifyPassword(
    currentPassword,
    current.passwordHash
  )
  if (!passwordMatches) {
    return { status: "error", message: "Your current password is incorrect." }
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      status: "error",
      message: `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: "The new passwords don't match." }
  }
  if (newPassword === currentPassword) {
    return {
      status: "error",
      message: "Choose a password you haven't used before.",
    }
  }

  const passwordHash = await hashPassword(newPassword)
  // Bumping the version invalidates every other outstanding session.
  const sessionVersion = current.sessionVersion + 1

  const updated = await updateUser(current.id, { passwordHash, sessionVersion })
  if (!updated) {
    return { status: "error", message: "We couldn't update your password." }
  }

  // Re-issue this browser's cookie with the new version so it stays signed in.
  await createSession(updated.id, updated.email, {
    remember: true,
    sessionVersion,
  })
  revalidatePath("/", "layout")

  return {
    status: "success",
    message:
      "Password changed. Any other signed-in devices have been signed out.",
  }
}

