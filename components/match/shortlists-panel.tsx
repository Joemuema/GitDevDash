"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteSavedShortlist,
  renameSavedShortlist,
  updateSavedShortlistNotes,
} from "@/lib/hire/actions"
import type { HireShortlist } from "@/lib/hire/shortlists"
import { encodeJdParam } from "@/lib/match/jd-codec"
import { hireJdRoute } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

/**
 * Step 10 — reload/rename/note/delete for the hirer's named shortlists.
 * Server supplies the list (`getMyShortlists`); mutations call the Step 10
 * actions and rely on `revalidatePath("/hire")` for fresh state.
 */
export function ShortlistsPanel({
  shortlists,
}: {
  shortlists: HireShortlist[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState("")

  function onReload(entry: HireShortlist) {
    router.push(
      hireJdRoute(encodeJdParam(entry.jdText), {
        devs: entry.logins.join(","),
      })
    )
  }

  function onRename(entry: HireShortlist) {
    const name = window.prompt("Rename shortlist", entry.name)
    if (!name || name.trim() === entry.name) return
    startTransition(async () => {
      await renameSavedShortlist(entry.id, name)
    })
  }

  function onSaveNotes(entry: HireShortlist) {
    startTransition(async () => {
      await updateSavedShortlistNotes(entry.id, notesDraft)
      setEditingNotes(null)
    })
  }

  function onDelete(entry: HireShortlist) {
    startTransition(async () => {
      await deleteSavedShortlist(entry.id)
    })
  }

  if (shortlists.length === 0) return null

  return (
    <ItemGroup>
      {shortlists.map((entry) => (
        <Item key={entry.id} variant="outline" size="sm">
          <ItemContent>
            <ItemTitle>{entry.name}</ItemTitle>
            <ItemDescription>
              {entry.logins.length} candidate
              {entry.logins.length === 1 ? "" : "s"}: {entry.logins.join(", ")}{" "}
              · {new Date(entry.updatedAt).toLocaleDateString()}
              {entry.notes ? ` · Notes: ${entry.notes}` : ""}
            </ItemDescription>
            {editingNotes === entry.id ? (
              <div className="mt-2 flex flex-col gap-2">
                <Textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={2}
                  placeholder="Onsite focus, interviewers, decisions…"
                  className="bg-card/90"
                  aria-label={`Interview notes for ${entry.name}`}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    onClick={() => onSaveNotes(entry)}
                  >
                    Save notes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingNotes(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </ItemContent>
          <ItemActions>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onReload(entry)}
            >
              Load
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRename(entry)}
            >
              Rename
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setNotesDraft(entry.notes)
                setEditingNotes(entry.id)
              }}
            >
              Notes
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={(props) => (
                  <Button
                    {...props}
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${entry.name}`}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  </Button>
                )}
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete shortlist?</AlertDialogTitle>
                  <AlertDialogDescription>
                    “{entry.name}” and its interview notes will be removed. This
                    can’t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(entry)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}
