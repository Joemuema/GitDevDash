"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { registerAccount, signInWithEmail } from "@/lib/auth/actions"
import {
  initialAuthFormState,
  type AuthFormState,
} from "@/lib/auth/form-state"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  InformationCircleIcon,
  LockIcon,
  Login01Icon,
  Mail01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

/**
 * Sign-in / sign-up panel.
 *
 * The sheet is controlled so the forms can close it as soon as a session is
 * established, and `router.refresh()` re-renders the server layout so the header
 * swaps its "Sign in" button for the account menu.
 */
export function LoginPopup({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Welcome back</SheetTitle>
          <SheetDescription>
            Sign in to your account or create a new one.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <EmailSignInCard onSignedIn={() => setOpen(false)} />

          <Divider label="Or continue with" />

          <Card>
            <CardContent className="pt-6">
              <GoogleSignInButton />
            </CardContent>
          </Card>

          <Divider label="New to GitDevDash?" />

          <CreateAccountCard onSignedIn={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Closes the sheet and refreshes server-rendered UI once a form action reports
 * success. The `handled` ref keeps the side effect from firing more than once per
 * result, since a state update and the following refresh both re-render.
 */
function useAcceptAuthResult(
  state: AuthFormState,
  onSignedIn: () => void
): void {
  const router = useRouter()
  const handled = useRef<AuthFormState | null>(null)

  useEffect(() => {
    if (state.status !== "success") return
    if (handled.current === state) return

    handled.current = state
    onSignedIn()
    router.refresh()
  }, [state, onSignedIn, router])
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center">
      <span className="h-px flex-1 bg-border" />
      <span className="px-3 text-xs text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function StatusAlert({ state }: { state: AuthFormState }) {
  if (state.status === "idle" || !state.message) return null

  const isError = state.status === "error"
  const isSuccess = state.status === "success"

  return (
    <Alert variant={isError ? "destructive" : "default"}>
      <HugeiconsIcon
        icon={
          isError
            ? Alert02Icon
            : isSuccess
              ? CheckmarkCircle02Icon
              : InformationCircleIcon
        }
        strokeWidth={2}
      />
      <AlertTitle>
        {isError ? "Check your details" : isSuccess ? "You're signed in" : "Almost there"}
      </AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  )
}

function EmailSignInCard({ onSignedIn }: { onSignedIn: () => void }) {
  const [state, formAction, isPending] = useActionState(
    signInWithEmail,
    initialAuthFormState
  )
  const [showResetHelp, setShowResetHelp] = useState(false)

  useAcceptAuthResult(state, onSignedIn)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sign in with email</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="signin-email">Email address</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </InputGroup>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="signin-password">Password</FieldLabel>
            <FieldContent>
              <PasswordField
                id="signin-password"
                name="password"
                autoComplete="current-password"
              />
            </FieldContent>
          </Field>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="remember" name="remember" defaultChecked />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0"
              aria-expanded={showResetHelp}
              onClick={() => setShowResetHelp((current) => !current)}
            >
              Forgot password?
            </Button>
          </div>

          {showResetHelp ? (
            <Alert>
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
              <AlertTitle>Password resets aren&apos;t wired up yet</AlertTitle>
              <AlertDescription>
                Emailing a reset link needs a mail provider, which this deployment
                doesn&apos;t have. Create a new account instead, or ask whoever
                runs this GitDevDash instance to clear the account for you.
              </AlertDescription>
            </Alert>
          ) : null}

          <StatusAlert state={state} />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Starts the Google OAuth flow.
 *
 * This is a plain link to a Route Handler rather than a Server Action so it keeps
 * working without JavaScript. When credentials are missing, `/api/auth/google`
 * redirects back with `?auth_error=not_configured`, which `AuthNotice` explains.
 */
function GoogleSignInButton() {
  return (
    <Button
      variant="outline"
      className="w-full"
      render={<a href="/api/auth/google" />}
    >
      <HugeiconsIcon icon={GoogleIcon} strokeWidth={2} className="size-4" />
      Continue with Google
    </Button>
  )
}

function CreateAccountCard({ onSignedIn }: { onSignedIn: () => void }) {
  const [state, formAction, isPending] = useActionState(
    registerAccount,
    initialAuthFormState
  )

  useAcceptAuthResult(state, onSignedIn)

  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle className="text-base">Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="signup-name">Full name</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon
                    icon={UserIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </InputGroup>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="signup-email">Email address</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </InputGroup>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <FieldContent>
              <PasswordField
                id="signup-password"
                name="password"
                autoComplete="new-password"
              />
            </FieldContent>
          </Field>

          <div className="flex items-center gap-2">
            <Switch id="signup-remember" name="remember" defaultChecked />
            <Label htmlFor="signup-remember" className="text-sm">
              Keep me signed in for 30 days
            </Label>
          </div>

          <StatusAlert state={state} />

          <Button type="submit" className="w-full" disabled={isPending}>
            <HugeiconsIcon
              icon={isPending ? CheckmarkCircle02Icon : Login01Icon}
              strokeWidth={2}
              className="size-4"
            />
            {isPending ? "Creating…" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordField({
  id,
  name,
  autoComplete,
  placeholder = "••••••••",
}: {
  id: string
  name: string
  autoComplete: string
  placeholder?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <HugeiconsIcon icon={LockIcon} strokeWidth={2} className="size-4" />
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        minLength={8}
      />
      <InputGroupAddon align="inline-end">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          <HugeiconsIcon
            icon={show ? EyeOffIcon : EyeIcon}
            strokeWidth={2}
            className="size-4"
          />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}


