"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  RepositoryIcon,
  Analytics01Icon,
  Notification01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

const onboardingSteps = [
  {
    name: "repositories",
    choices: [{ value: "public" }, { value: "starred" }, { value: "pinned" }],
  },
  {
    name: "insights",
    choices: [
      { value: "language" },
      { value: "activity" },
      { value: "trends" },
    ],
  },
  {
    name: "notifications",
    choices: [{ value: "email" }, { value: "web" }, { value: "none" }],
  },
]

export function OnboardingFlow({ onComplete }: { onComplete?: () => void }) {
  const [completed, setCompleted] = useState(false)

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2}
            className="size-6 text-green-600"
          />
        </div>
        <CardTitle>Welcome aboard!</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Your preferences have been saved. Update them anytime in Settings.
        </p>
      </div>
    )
  }
  return (
    <div className="w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Set up your dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Questionnaire
            items={onboardingSteps}
            defaultItem="repositories"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault()
              setCompleted(true)
              onComplete?.()
            }}
          >
            {/* QuestionnaireProgress reads Questionnaire.Root context, so it
                must be rendered inside the root, not in the outer CardHeader. */}
            <QuestionnaireProgress />
            <QuestionnaireItem name="repositories">
              <QuestionnaireTitle>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={RepositoryIcon}
                    strokeWidth={2}
                    className="size-5"
                  />
                  What repositories do you want to track?
                </div>
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                Select the repositories you&apos;d like to monitor for your
                dashboard.
              </QuestionnaireDescription>

              <QuestionnaireChoices>
                <QuestionnaireChoice value="public">
                  <span className="font-medium">Public repositories</span>
                  <p className="text-sm text-muted-foreground">
                    Track all public repos for this developer.
                  </p>
                </QuestionnaireChoice>
                <QuestionnaireChoice value="starred">
                  <span className="font-medium">Starred repositories</span>
                  <p className="text-sm text-muted-foreground">
                    Only track repos they&apos;ve starred.
                  </p>
                </QuestionnaireChoice>
                <QuestionnaireChoice value="pinned">
                  <span className="font-medium">Pinned repositories</span>
                  <p className="text-sm text-muted-foreground">
                    Focus on their carefully selected pinned repos.
                  </p>
                </QuestionnaireChoice>
              </QuestionnaireChoices>

              <QuestionnaireActions>
                <QuestionnaireSkip />
                <QuestionnaireNext />
              </QuestionnaireActions>
            </QuestionnaireItem>

            <QuestionnaireItem name="insights" multiple>
              <QuestionnaireTitle>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Analytics01Icon}
                    strokeWidth={2}
                    className="size-5"
                  />
                  What kind of insights interest you?
                </div>
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                Pick as many as you like — they all appear on the dashboard.
              </QuestionnaireDescription>

              <QuestionnaireChoices>
                <QuestionnaireChoice value="language">
                  <span className="font-medium">Language breakdown</span>
                  <p className="text-sm text-muted-foreground">
                    See what languages the developer writes in.
                  </p>
                </QuestionnaireChoice>
                <QuestionnaireChoice value="activity">
                  <span className="font-medium">Activity trends</span>
                  <p className="text-sm text-muted-foreground">
                    View commit history and contribution patterns.
                  </p>
                </QuestionnaireChoice>
                <QuestionnaireChoice value="trends">
                  <span className="font-medium">Repo trends</span>
                  <p className="text-sm text-muted-foreground">
                    See which projects are gaining stars.
                  </p>
                </QuestionnaireChoice>
              </QuestionnaireChoices>

              <QuestionnaireActions>
                <QuestionnairePrevious />
                <QuestionnaireSkip />
                <QuestionnaireNext />
              </QuestionnaireActions>
            </QuestionnaireItem>

            <QuestionnaireItem name="notifications">
              <QuestionnaireTitle>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Notification01Icon}
                    strokeWidth={2}
                    className="size-5"
                  />
                  How would you like to receive notifications?
                </div>
              </QuestionnaireTitle>
              <QuestionnaireDescription>
                Select your preferred notification channels.
              </QuestionnaireDescription>

              <QuestionnaireChoices>
                <QuestionnaireChoice value="email">
                  <span className="font-medium">Email</span>
                  <p className="text-sm text-muted-foreground">
                    Get updates sent to your inbox.
                  </p>
                </QuestionnaireChoice>
                <QuestionnaireChoice value="web">
                  <span className="font-medium">In-app</span>
                  <p className="text-sm text-muted-foreground">
                    See notifications inside the dashboard.
                  </p>
                </QuestionnaireChoice>
                <QuestionnaireChoice value="none">
                  <span className="font-medium">Off</span>
                  <p className="text-sm text-muted-foreground">
                    No notifications, please.
                  </p>
                </QuestionnaireChoice>
              </QuestionnaireChoices>

              <QuestionnaireActions>
                <QuestionnairePrevious />
                <QuestionnaireSkip />
                <QuestionnaireSubmit>Finish</QuestionnaireSubmit>
              </QuestionnaireActions>
            </QuestionnaireItem>
          </Questionnaire>
        </CardContent>
      </Card>
    </div>
  )
}
