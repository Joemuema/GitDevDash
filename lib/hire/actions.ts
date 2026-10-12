"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUserRecord } from "@/lib/auth/dal"
import { requireRole } from "@/lib/auth/require-role"
import {
  getOwnEndorsements,
  removeEndorsement,
  upsertEndorsement,
} from "@/lib/hire/endorsements"
import {
  createShortlist,
  deleteShortlist,
  listShortlists,
  renameShortlist,
  updateShortlistNotes,
  type HireShortlist,
} from "@/lib/hire/shortlists"

/**
 * Step 10 — hirer workspace actions (endorsements + named shortlists).
 *
 * Every mutation goes through `requireRole("hirer")` so developers and
 * anonymous visitors can never write hirer data, even by calling the action
 * directly. Reads used for toggle/panel state resolve the account from the
 * session instead of trusting a client-supplied id. Like the auth actions,
 * this is a `"use server"` module: async function exports only.
 */

function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function readList(formData: FormData, key: string): string[] {
  const value = formData.get(key)
  if (typeof value !== "string") return []
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

export async function toggleEndorsement(
  login: string,
  roleTag: string,
  langTags: string[],
  allowedTags: string[]
): Promise<{ endorsed: boolean }> {
  const user = await requireRole("hirer")
  const cleaned = login.trim()
  if (!cleaned) return { endorsed: false }
  const own = await getOwnEndorsements(user.id, [cleaned])
  if (own[cleaned]) {
    await removeEndorsement(user.id, cleaned)
  } else {
    await upsertEndorsement({
      accountId: user.id,
      login: cleaned,
      roleTag,
      langTags,
      allowedTags,
    })
  }
  revalidatePath("/hire")
  return { endorsed: !own[cleaned] }
}

export async function saveShortlist(
  _previousState: { status: string; message: string },
  formData: FormData
): Promise<{ status: string; message: string }> {
  const user = await requireRole("hirer")
  const result = await createShortlist({
    accountId: user.id,
    name: readField(formData, "name"),
    jdText: String(formData.get("jdText") ?? ""),
    logins: readList(formData, "logins"),
    notes: String(formData.get("notes") ?? ""),
  })
  if (!result.ok) {
    return {
      status: "error",
      message:
        "Couldn't save — give it a name, keep the JD text, and stay under 20 saved shortlists.",
    }
  }
  revalidatePath("/hire")
  return {
    status: "success",
    message: `Saved “${result.shortlist.name}” for the interview handoff.`,
  }
}

export async function renameSavedShortlist(
  id: string,
  name: string
): Promise<void> {
  const user = await requireRole("hirer")
  await renameShortlist(user.id, id, name)
  revalidatePath("/hire")
}

export async function updateSavedShortlistNotes(
  id: string,
  notes: string
): Promise<void> {
  const user = await requireRole("hirer")
  await updateShortlistNotes(user.id, id, notes)
  revalidatePath("/hire")
}

export async function deleteSavedShortlist(id: string): Promise<void> {
  const user = await requireRole("hirer")
  await deleteShortlist(user.id, id)
  revalidatePath("/hire")
}

/** Shortlists for the signed-in hirer — `[]` for anyone else (panel hides). */
export async function getMyShortlists(): Promise<HireShortlist[]> {
  const record = await getCurrentUserRecord()
  if (!record || record.role !== "hirer") return []
  return listShortlists(record.id)
}
