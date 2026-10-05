"use client"

import Link from "next/link"
import { useState } from "react"

import { AccountSettings } from "@/components/settings/account-settings"
import { LoginPopup } from "@/components/auth/login-popup"
import { PageContainer } from "@/components/layout/page-container"
import { ONBOARDING_STORAGE_KEY } from "@/components/onboarding/onboarding-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { useFavorites } from "@/hooks/use-favorites"
import { routes } from "@/lib/routes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Analytics01Icon,
  FavouriteIcon,
  PaintBrush01Icon,
  Rocket01Icon,
  SlidersHorizontalIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"

const densityOptions = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
] as const

export default function SettingsPage() {
  const { count, isReady } = useFavorites()
  const { isAuthenticated } = useAuth()
  const [density, setDensity] = useState<
    (typeof densityOptions)[number]["value"]
  >("comfortable")
  const [showAvatars, setShowAvatars] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [notifyNewRepos, setNotifyNewRepos] = useState(true)
  const [notifyMilestones, setNotifyMilestones] = useState(true)
  const [notifyDigest, setNotifyDigest] = useState(false)

  function resetOnboarding() {
    try {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    window.location.reload()
  }

  return (
    <PageContainer className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Personalize how GitDevDash looks and what it tells you about.
        </p>
      </header>

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">
            <HugeiconsIcon icon={PaintBrush01Icon} strokeWidth={2} />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data">
            <HugeiconsIcon icon={SlidersHorizontalIcon} strokeWidth={2} />
            Data
          </TabsTrigger>
          <TabsTrigger value="account">
            <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Look and feel</CardTitle>
              <CardDescription>
                Adjust the density and motion of the interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldTitle>List density</FieldTitle>
                  <FieldContent>
                    <div className="flex flex-wrap gap-2">
                      {densityOptions.map((option) => (
                        <Toggle
                          key={option.value}
                          variant="outline"
                          size="sm"
                          pressed={density === option.value}
                          onPressedChange={(pressed) => {
                            if (pressed) setDensity(option.value)
                          }}
                        >
                          {option.label}
                        </Toggle>
                      ))}
                    </div>
                    <FieldDescription>
                      Compact mode fits more repositories on screen.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field orientation="horizontal">
                  <Switch
                    id="settings-avatars"
                    checked={showAvatars}
                    onCheckedChange={setShowAvatars}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="settings-avatars">
                      Show developer avatars
                    </FieldLabel>
                    <FieldDescription>
                      Display profile pictures in result cards.
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Field orientation="horizontal">
                  <Switch
                    id="settings-motion"
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="settings-motion">
                      Reduce motion
                    </FieldLabel>
                    <FieldDescription>
                      Minimize animation in charts and carousels.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose which updates you care about.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldTitle>In-app alerts</FieldTitle>
                  <FieldContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="notify-repos"
                          checked={notifyNewRepos}
                          onCheckedChange={(value) =>
                            setNotifyNewRepos(Boolean(value))
                          }
                        />
                        <Label htmlFor="notify-repos" className="text-sm">
                          New repositories
                        </Label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="notify-milestones"
                          checked={notifyMilestones}
                          onCheckedChange={(value) =>
                            setNotifyMilestones(Boolean(value))
                          }
                        />
                        <Label htmlFor="notify-milestones" className="text-sm">
                          Star milestones
                        </Label>
                      </div>
                    </div>
                  </FieldContent>
                </Field>

                <Field orientation="horizontal">
                  <Switch
                    id="settings-digest"
                    checked={notifyDigest}
                    onCheckedChange={setNotifyDigest}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="settings-digest">
                      Weekly email digest
                    </FieldLabel>
                    <FieldDescription>
                      A summary of activity for your saved developers.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved data</CardTitle>
              <CardDescription>
                Favorites are stored locally on this device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary">
                  <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
                  {isReady ? count : 0} saved
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={routes.favorites} />}
                >
                  Manage favorites
                </Button>
              </div>
              {isAuthenticated ? (
                <p className="text-sm text-muted-foreground">
                  You&apos;re signed in. Profile, password and sessions live on
                  the Account tab.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Sign in to keep your profile and favorites together.
                  </p>
                  <LoginPopup
                    trigger={
                      <Button size="sm" variant="outline">
                        Sign in
                      </Button>
                    }
                  />
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Setup</CardTitle>
              <CardDescription>
                Re-run the guided questionnaire at any time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tooltip>
                <TooltipTrigger
                  render={(props) => (
                    <Button
                      {...props}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetOnboarding}
                    />
                  )}
                >
                  <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} />
                  Restart onboarding
                </TooltipTrigger>
                <TooltipContent>
                  Clears the saved setup state and reloads the page
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="pt-4">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}