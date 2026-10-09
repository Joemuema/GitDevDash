"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { encodeJdParam } from "@/lib/match/jd-param"
import { HugeiconsIcon } from "@hugeicons/react"
import { Briefcase01Icon } from "@hugeicons/core-free-icons"

export function JdInput({ defaultText = "" }: { defaultText?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [text, setText] = useState(defaultText)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) {
      router.push(pathname)
      return
    }
    router.push(`${pathname}?jd=${encodeJdParam(trimmed)}`)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label
        htmlFor="jd-text"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={2} />
        Paste a job description
      </label>
      <Textarea
        id="jd-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Senior Frontend Engineer — React, TypeScript, Next.js…"
        rows={4}
        className="bg-card/90"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Score this developer
        </Button>
        {defaultText ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setText("")
              router.push(pathname)
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  )
}
