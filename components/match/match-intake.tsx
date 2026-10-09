"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { encodeJdParam } from "@/lib/match/jd-param"
import { MAX_MATCH_CANDIDATES } from "@/lib/match/match-batch"
import { routes } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Briefcase01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"

export function MatchIntake({
  defaultJd = "",
  defaultDevs = "",
}: {
  defaultJd?: string
  defaultDevs?: string
}) {
  const router = useRouter()
  const [jdText, setJdText] = useState(defaultJd)
  const [devs, setDevs] = useState(defaultDevs)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const jd = jdText.trim()
    const logins = devs
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean)
    if (!jd || logins.length === 0) return
    router.push(routes.match({ jd: encodeJdParam(jd), devs: logins.join(",") }))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field>
        <FieldTitle>
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} />
            <label htmlFor="match-jd">Job description</label>
          </span>
        </FieldTitle>
        <Textarea
          id="match-jd"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Senior Backend Engineer — Go, PostgreSQL, Kubernetes…"
          rows={6}
          className="bg-card/90"
        />
        <FieldDescription>
          Parsed locally into languages, frameworks and keywords. Nothing is
          stored.
        </FieldDescription>
      </Field>
      <Field>
        <FieldTitle>
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
            <label htmlFor="match-devs">
              Candidates (up to {MAX_MATCH_CANDIDATES}, comma-separated)
            </label>
          </span>
        </FieldTitle>
        <Textarea
          id="match-devs"
          value={devs}
          onChange={(e) => setDevs(e.target.value)}
          placeholder="octocat, sindresorhus"
          rows={2}
          className="bg-card/90"
        />
        <FieldDescription>
          Tip: save developers to Favorites first, then copy their logins here.
        </FieldDescription>
      </Field>
      <Button type="submit" size="sm">
        Rank shortlist
      </Button>
    </form>
  )
}
