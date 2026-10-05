"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState, useTransition } from "react"

import { LoginPopup } from "@/components/auth/login-popup"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import {
  changePassword,
  signOut,
  updateProfile,
} from "@/lib/auth/actions"
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
  Logout01Icon,
  Mail01Icon,
  UserCircleIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

/**
 * Account tab for the settings page.
 *
 * Everything here reads the user from `useAuth()`, which the app layout seeds from
 * the server session. After a successful mutation the forms call
 * `router.refresh()` so the layout re-renders with fresh server data.
 */
export function AccountSettings() {
  const { user } = useAuth()

  if (!user) {
    return <SignedOutCard />
  }

  return (
    <div className="space-y-4">
      <ProfileSummaryCard
        name={user.name}
        email={user.email}
        image={user.image}
        provider={user.provider}
        createdAt={user.createdAt}
      />
      <ProfileFormCard currentName={user.name} />
      {user.provider === "email" ? (
        <PasswordFormCard />
      ) : (
        <GoogleAccountCard email={user.email} />
      )}
      <SignOutCard />
    </div>
  )
}

function initialsFor(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatJoined(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** Renders an action result as a dismissible-free inline status. */
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
          ? "Something needs fixing"
          : state.status === "success"
            ? "Saved"
            : "Heads up"}
      </AlertTitle>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  )
}

/**
 * Refreshes server-rendered UI once a form action succeeds, exactly once per
 * result (the ref guards against the refresh-triggered re-render repeating it).
 */
function useRefreshOnSuccess(state: AuthFormState): void {
  const router = useRouter()
  const handled = useRef<AuthFormState | null>(null)

  useEffect(() => {
    if (state.status !== "success") return
    if (handled.current === state) return

    handled.current = state
    router.refresh()
  }, [state, router])
}

function SignedOutCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Sign in to keep your profile, favorites and preferences together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginPopup
          trigger={
            <Button size="sm">
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
              Sign in or create an account
            </Button>
          }
        />
      </CardContent>
    </Card>
  )
}

function ProfileSummaryCard({
  name,
  email,
  image,
  provider,
  createdAt,
}: {
  name: string
  email: string
  image: string | null
  provider: "email" | "google"
  createdAt: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How your account appears in GitDevDash.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar size="lg">
          {image ? <AvatarImage src={image} alt="" /> : null}
          <AvatarFallback>{initialsFor(name || email)}</AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <HugeiconsIcon
              icon={Mail01Icon}
              strokeWidth={2}
              className="size-4"
            />
            {email}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="secondary">
              <HugeiconsIcon
                icon={provider === "google" ? GoogleIcon : Mail01Icon}
                strokeWidth={2}
              />
              {provider === "google" ? "Google account" : "Email account"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Joined {formatJoined(createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileFormCard({ currentName }: { currentName: string }) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialAuthFormState
  )

  useRefreshOnSuccess(state)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display name</CardTitle>
        <CardDescription>
          Shown in the header and anywhere GitDevDash greets you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="profile-name">Name</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon
                    icon={UserCircleIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  id="profile-name"
                  name="name"
                  type="text"
                  defaultValue={currentName}
                  autoComplete="name"
                  required
                />
              </InputGroup>
              <FieldDescription>
                Changes apply everywhere as soon as you save.
              </FieldDescription>
            </FieldContent>
          </Field>

          <ResultAlert state={state} />

          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/** Password input with a show/hide toggle, reused by the change-password form. */
function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder = "••••••••",
  label,
  description,
}: {
  id: string
  name: string
  autoComplete: string
  placeholder?: string
  label: string
  description?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
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
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldContent>
    </Field>
  )
}

function PasswordFormCard() {
  const [state, formAction, isPending] = useActionState(
    changePassword,
    initialAuthFormState
  )

  useRefreshOnSuccess(state)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Changing your password signs out every other device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FieldGroup>
            <PasswordInput
              id="current-password"
              name="currentPassword"
              autoComplete="current-password"
              label="Current password"
            />
            <PasswordInput
              id="new-password"
              name="newPassword"
              autoComplete="new-password"
              label="New password"
              description="At least 8 characters."
            />
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              label="Confirm new password"
            />
          </FieldGroup>

          <ResultAlert state={state} />

          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function GoogleAccountCard({ email }: { email: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Managed by your Google account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          <AlertTitle>Signed in with Google</AlertTitle>
          <AlertDescription>
            {email} uses Google to sign in, so GitDevDash never stores a password
            for it. Manage it from your Google Account security settings.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function SignOutCard() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>
          Signing out clears the session cookie on this device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            You&apos;ll need to sign in again to reach your account.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleSignOut}
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
            {isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


