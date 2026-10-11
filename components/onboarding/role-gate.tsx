"use client"

import { RolePicker } from "@/components/onboarding/role-picker"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { roleHome } from "@/lib/auth/roles"
import { useRouter } from "next/navigation"
import { useState } from "react"

/**
 * Forces the interface choice exactly once: signed-in users whose stored role
 * is `null` (pre-role accounts and fresh sign-ups) get the picker as a modal
 * until they choose. Anonymous visitors and users with a role never see it.
 */
export function RoleGate() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  const open = isAuthenticated && user?.role === null && !dismissed
  if (!open) return null

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) setDismissed(true)
      }}
    >
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92svh] w-full max-w-3xl overflow-y-auto"
        aria-describedby="role-gate-description"
      >
        <SheetHeader>
          <SheetTitle>Choose your interface</SheetTitle>
          <SheetDescription id="role-gate-description">
            Hirers get matching and shortlists; developers get visibility and
            repo tips. You can switch anytime in Settings.
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-center px-2 pb-2">
          <RolePicker
            currentRole={null}
            onSaved={(role) => {
              setDismissed(true)
              router.push(roleHome(role))
              router.refresh()
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
