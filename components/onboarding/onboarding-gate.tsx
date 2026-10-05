"use client"

import { useSyncExternalStore, useState } from "react"

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export const ONBOARDING_STORAGE_KEY = "gitdevdash:onboarded"

/**
 * localStorage is an external system, so the flag is read with
 * `useSyncExternalStore`. The server snapshot reports "already onboarded" so
 * the first client render matches the server render exactly.
 */
const subscribe = () => () => {}

function getOnboardedSnapshot(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true"
  } catch {
    return true
  }
}

function getOnboardedServerSnapshot(): boolean {
  return true
}

function persistOnboarded() {
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
  } catch {
    // Storage unavailable (private mode); keep the gate closed for this session.
  }
}

/**
 * Shows the guided setup questionnaire the first time a visitor lands in the
 * app, then remembers the choice on this device.
 */
export function OnboardingGate() {
  const onboarded = useSyncExternalStore(
    subscribe,
    getOnboardedSnapshot,
    getOnboardedServerSnapshot
  )
  const [dismissed, setDismissed] = useState(false)
  const open = !onboarded && !dismissed

  function dismiss() {
    persistOnboarded()
    setDismissed(true)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss()
      }}
    >
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92svh] w-full max-w-3xl overflow-y-auto"
        aria-describedby="onboarding-gate-description"
      >
        <SheetHeader>
          <SheetTitle>Welcome to GitDevDash</SheetTitle>
          <SheetDescription id="onboarding-gate-description">
            Answer a few quick questions to personalize your dashboard. You can
            change these anytime in Settings.
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-center px-2 pb-2">
          <OnboardingFlow onComplete={dismiss} />
        </div>
      </SheetContent>
    </Sheet>
  )
}