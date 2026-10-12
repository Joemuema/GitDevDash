"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { saveShortlist } from "@/lib/hire/actions"

/**
 * Step 10 — saves the current `/hire` run as a named shortlist for the
 * interview handoff. The JD text + logins travel as hidden fields so the
 * saved record matches exactly what was ranked.
 */
export function ShortlistSaver({
  jdText,
  logins,
}: {
  jdText: string
  logins: string
}) {
  const [state, formAction] = useActionState(saveShortlist, {
    status: "",
    message: "",
  })

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="jdText" value={jdText} />
      <input type="hidden" name="logins" value={logins} />
      <Field>
        <FieldTitle>
          <label htmlFor="shortlist-name">Save this run</label>
        </FieldTitle>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="shortlist-name"
            name="name"
            placeholder="Senior backend — onsite shortlist"
            maxLength={80}
            autoComplete="off"
            className="bg-card/90"
          />
          <Button type="submit" size="sm" className="shrink-0">
            Save shortlist
          </Button>
        </div>
        <FieldDescription>
          Stores the JD, candidate logins, and your notes below.
        </FieldDescription>
      </Field>
      <Field>
        <FieldTitle>
          <label htmlFor="shortlist-notes">Interview notes</label>
        </FieldTitle>
        <Textarea
          id="shortlist-notes"
          name="notes"
          rows={2}
          placeholder="Onsite focus: system design + Go deep-dive…"
          className="bg-card/90"
        />
      </Field>
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "text-sm text-emerald-600 dark:text-emerald-400"
              : "text-sm text-destructive"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
