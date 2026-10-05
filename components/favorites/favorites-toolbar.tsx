"use client"

import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ChevronDownIcon,
  FilterIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

export type FavSort = "recent" | "name" | "followers"

const SORT_OPTIONS: { value: FavSort; label: string }[] = [
  { value: "recent", label: "Recently saved" },
  { value: "name", label: "Name" },
  { value: "followers", label: "Followers" },
]

export function FavoritesToolbar({
  filter,
  sort,
  count,
  onFilterChange,
  onSortChange,
  onClearAll,
}: {
  filter: string
  sort: FavSort
  count: number
  onFilterChange: (value: string) => void
  onSortChange: (value: FavSort) => void
  onClearAll: () => void
}) {
  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Sort"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <InputGroup className="sm:max-w-sm">
        <InputGroupAddon align="inline-start">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Filter by name or username..."
          aria-label="Filter favorites"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </InputGroup>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button {...props} type="button" variant="outline" size="sm" />
            )}
          >
            <HugeiconsIcon icon={FilterIcon} strokeWidth={2} className="size-4" />
            {sortLabel}
            <HugeiconsIcon
              icon={ChevronDownIcon}
              strokeWidth={2}
              className="size-4"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => onSortChange(value as FavSort)}
            >
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {count > 0 ? (
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <AlertDialogTrigger
                    {...props}
                    render={(triggerProps) => (
                      <Button
                        {...triggerProps}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                      />
                    )}
                  />
                )}
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                <span>Clear all</span>
              </TooltipTrigger>
              <TooltipContent>Remove all {count} saved developers</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all favorites?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {count} saved developers from your
                  favorites list. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAll}>
                  Clear all favorites
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </div>
  )
}