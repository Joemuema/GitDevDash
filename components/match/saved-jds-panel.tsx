"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { useAuth } from "@/hooks/use-auth"
import { useSavedJds } from "@/hooks/use-saved-jds"
import { encodeJdParam } from "@/lib/match/jd-codec"
import { routes } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

export function SavedJdsPanel({
  currentText,
  currentLogins,
}: {
  currentText: string
  currentLogins: string
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { savedJds, isReady, saveJd, removeJd } = useSavedJds()
  const [savedFlash, setSavedFlash] = useState(false)

  function onSaveCurrent() {
    const text = currentText.trim()
    if (!text) return
    const logins = currentLogins
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean)
    const title = text.split("\n")[0].slice(0, 60)
    saveJd(title, text, logins)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2000)
  }

  function onLoad(id: string) {
    const entry = savedJds.find((j) => j.id === id)
    if (!entry) return
    router.push(
      routes.match({
        jd: encodeJdParam(entry.text),
        devs: entry.logins.join(","),
      })
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveCurrent}
          disabled={!currentText.trim()}
        >
          {savedFlash ? "Saved" : "Save this JD"}
        </Button>
        {!isAuthenticated ? (
          <p className="text-xs text-muted-foreground">
            Saved in this browser. Sign in to sync saved roles across devices
            (coming with account sync).
          </p>
        ) : null}
      </div>
      {isReady && savedJds.length > 0 ? (
        <ItemGroup>
          {savedJds.map((entry) => (
            <Item key={entry.id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>{entry.title}</ItemTitle>
                <ItemDescription>
                  {entry.logins.length > 0
                    ? `${entry.logins.length} candidate${entry.logins.length === 1 ? "" : "s"}: ${entry.logins.join(", ")}`
                    : "No candidates stored"}
                  {" · "}
                  {new Date(entry.savedAt).toLocaleDateString()}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoad(entry.id)}
                >
                  Load
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${entry.title}`}
                  onClick={() => removeJd(entry.id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      ) : null}
    </div>
  )
}
