"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Questionnaire,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireItem,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { setRole } from "@/lib/auth/actions"
import { initialAuthFormState, type AuthFormState } from "@/lib/auth/form-state"
import type { UserRole } from "@/lib/auth/types"
import { roleHome } from "@/lib/auth/roles"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

const roleSteps = [
  { name: "role", choices: [{ value: "hirer" }, { value: "developer" }] },
]

function ResultAlert({ state }: { state: AuthFormState }) {
  if (state.status === "idle" || !state.message) return null
  const isError = state.status === "error"
  return (
    <Alert variant={isError ? "destructive" : "default"}>
      <HugeiconsIcon
        icon={
          isError
            ? Alert02Icon
            : state.status === "success"
              ? CheckmarkCircle02Icon
              : InformationCircleIcon
        }
        strokeWidth={2}
      />
      <AlertTitle>
        {isError
          ? "Check your choice"
          : state.status === "success"
            ? "Saved"
            : "Heads up"}
      </AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  )
}

/**
 * Single-question role picker. The Questionnaire root is a real `<form>`, so the
 * selected `role` radio ships as FormData straight into the `setRole` action.
 */
export function RolePicker({
  currentRole,
  onSaved,
}: {
  currentRole: UserRole | null
  onSaved?: (role: UserRole) => void
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    setRole,
    initialAuthFormState
  )
  const announced = useRef(false)

  // `useActionState` surfaces the *returned* state, not the submitted role, so
  // recover the chosen role from the success copy. The message is produced by
  // `setRole` above, which always starts with the interface name on success.
  useEffect(() => {
    if (state.status !== "success" || announced.current) return
    announced.current = true
    onSaved?.(state.message.startsWith("Hirer") ? "hirer" : "developer")
    router.refresh()
  }, [state, router, onSaved])

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Choose your interface</CardTitle>
        <CardDescription>
          Hirers match developers against job descriptions. Developers grow
          visibility and tailor repos. You can switch anytime in Settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Questionnaire items={roleSteps} defaultItem="role" action={formAction}>
          <QuestionnaireItem name="role">
            <QuestionnaireTitle>Which best describes you?</QuestionnaireTitle>
            <QuestionnaireDescription>
              This only changes which workspace you land in — every base feature
              stays available either way.
            </QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="hirer">
                <span className="flex items-center gap-2 font-medium">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  I hire developers
                </span>
                <p className="text-sm text-muted-foreground">
                  Rank candidates against a job description, compare shortlists,
                  and hand off to interviews.
                </p>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="developer">
                <span className="flex items-center gap-2 font-medium">
                  <HugeiconsIcon
                    icon={UserIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  I&apos;m a developer
                </span>
                <p className="text-sm text-muted-foreground">
                  See what hirers look for, check who viewed you, and tailor
                  your repos to get picked.
                </p>
              </QuestionnaireChoice>
            </QuestionnaireChoices>
            <div className="mt-4 space-y-3">
              <ResultAlert state={state} />
              <QuestionnaireSubmit disabled={isPending}>
                {isPending ? "Saving…" : "Continue"}
              </QuestionnaireSubmit>
            </div>
          </QuestionnaireItem>
        </Questionnaire>
        {currentRole ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Current interface:{" "}
            <span className="font-medium">
              {currentRole === "hirer" ? "Hirer" : "Developer"} —{" "}
              <a className="underline" href={roleHome(currentRole)}>
                go to {currentRole === "hirer" ? "Hire" : "Grow"}
              </a>
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
