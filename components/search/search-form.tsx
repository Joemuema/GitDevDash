"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { searchRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  ChevronDownIcon,
  FilterIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

export function SearchForm({
  defaultQuery = "",
  defaultLocation = "",
  defaultLanguage = "",
  defaultReposMin = "",
  defaultJoinedAfter = "",
  autoFocus,
}: {
  defaultQuery?: string
  defaultLocation?: string
  defaultLanguage?: string
  defaultReposMin?: string
  defaultJoinedAfter?: string
  autoFocus?: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [location, setLocation] = useState(defaultLocation)
  const [language, setLanguage] = useState(defaultLanguage)
  const [reposMin, setReposMin] = useState(defaultReposMin)
  const [joinedAfter, setJoinedAfter] = useState(defaultJoinedAfter)
  const [dateOpen, setDateOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(
    Boolean(
      defaultLocation || defaultLanguage || defaultReposMin || defaultJoinedAfter
    )
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    const params: Record<string, string> = {}
    if (location.trim()) params.location = location.trim()
    if (language.trim()) params.language = language.trim()
    if (reposMin.trim()) params.repos = reposMin.trim()
    if (joinedAfter) params.joinedAfter = joinedAfter

    router.push(searchRoute(trimmed, params))
  }

  const activeFilterCount = [location, language, reposMin, joinedAfter].filter(
    (value) => value.trim()
  ).length

  return (
    <form onSubmit={onSubmit} className="space-y-3" role="search">
      <label htmlFor="developer-search" className="text-sm font-medium">
        Search developers
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </InputGroupAddon>
          <InputGroupInput
            id="developer-search"
            name="q"
            type="search"
            placeholder="Username, name, or keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={autoFocus}
            autoComplete="off"
          />
        </InputGroup>
        <Button type="submit" className="shrink-0">
          Search
        </Button>
      </div>

      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger
          render={(props) => (
            <Button
              {...props}
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            />
          )}
        >
          <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-4" />
          Advanced filters
          {activeFilterCount > 0 ? (
            <span className="tabular-nums">({activeFilterCount})</span>
          ) : null}
          <HugeiconsIcon
            icon={ChevronDownIcon}
            strokeWidth={2}
            className={cn(
              "size-4 transition-transform",
              advancedOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <InputGroup className="flex-1">
              <InputGroupAddon align="inline-start">
                <span className="text-xs">Location</span>
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                autoComplete="off"
                aria-label="Filter by location"
              />
            </InputGroup>
            <InputGroup className="flex-1">
              <InputGroupAddon align="inline-start">
                <span className="text-xs">Language</span>
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="TypeScript"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                autoComplete="off"
                aria-label="Filter by language"
              />
            </InputGroup>
            <InputGroup className="sm:w-44">
              <InputGroupAddon align="inline-start">
                <span className="text-xs">Min repos</span>
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                placeholder="0"
                value={reposMin}
                onChange={(e) =>
                  setReposMin(e.target.value.replace(/\D/g, ""))
                }
                autoComplete="off"
                aria-label="Minimum number of repositories"
              />
            </InputGroup>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger
                render={(props) => (
                  <Button
                    {...props}
                    type="button"
                    variant="outline"
                    className="justify-start gap-2 font-normal"
                  />
                )}
              >
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                {joinedAfter ? formatLabel(joinedAfter) : "Joined after"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={joinedAfter ? new Date(joinedAfter) : undefined}
                  onSelect={(date) => {
                    setJoinedAfter(date ? format(date, "yyyy-MM-dd") : "")
                    setDateOpen(false)
                  }}
                  disabled={{ after: new Date() }}
                />
                {joinedAfter ? (
                  <div className="border-t p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setJoinedAfter("")
                        setDateOpen(false)
                      }}
                    >
                      Clear date
                    </Button>
                  </div>
                ) : null}
              </PopoverContent>
            </Popover>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </form>
  )
}

function formatLabel(value: string): string {
  try {
    return format(new Date(value), "MMM d, yyyy")
  } catch {
    return value
  }
}