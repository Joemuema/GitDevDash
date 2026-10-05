"use client"

import { useCallback, useMemo, useState } from "react"
import {
  FlexRender,
  columnVisibilityFeature,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type SortingState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronDownIcon,
  EyeIcon,
  File01Icon,
  Folder02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { RepoTreeFile } from "@/lib/types/github"
import { cn } from "@/lib/utils"

/**
 * Table features are declared statically so the table instance only ships the
 * row models and APIs this explorer actually uses (TanStack Table v9).
 */
const features = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
})

type FlatFile = {
  name: string
  path: string
  depth: number
  type: "file" | "folder"
  size: number | null
}

function flattenFiles(
  nodes: RepoTreeFile[],
  depth = 0,
  expanded: Set<string>
): FlatFile[] {
  const result: FlatFile[] = []
  for (const node of nodes) {
    if (node.type === "folder") {
      result.push({
        name: node.name,
        path: node.path,
        depth,
        type: "folder",
        size: null,
      })
      if (node.children && expanded.has(node.path)) {
        result.push(...flattenFiles(node.children, depth + 1, expanded))
      }
    } else {
      result.push({
        name: node.name,
        path: node.path,
        depth,
        type: "file",
        size: node.size,
      })
    }
  }
  return result
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB"]
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}
export function FileExplorer({
  files,
  maxHeight = 420,
  truncated = false,
}: {
  files: RepoTreeFile[]
  maxHeight?: number
  truncated?: boolean
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of files) {
      if (node.type === "folder") initial.add(node.path)
    }
    return initial
  })

  const toggleExpand = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const flatData: FlatFile[] = useMemo(
    () => flattenFiles(files, 0, expanded),
    [files, expanded]
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({})

  const columns = useMemo<ColumnDef<typeof features, FlatFile>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const file = row.original
          const isFolder = file.type === "folder"
          const isExpanded = isFolder && expanded.has(file.path)

          return (
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${file.depth * 1.25}rem` }}
            >
              {isFolder ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded ? `Collapse ${file.name}` : `Expand ${file.name}`
                  }
                  onClick={() => toggleExpand(file.path)}
                >
                  <HugeiconsIcon
                    icon={ChevronDownIcon}
                    strokeWidth={2}
                    className={cn(
                      "size-3 transition-transform",
                      isExpanded ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </Button>
              ) : (
                <span className="inline-block size-6" aria-hidden="true" />
              )}
              {isFolder ? (
                <HugeiconsIcon
                  icon={Folder02Icon}
                  strokeWidth={2}
                  className="size-4 text-yellow-400"
                />
              ) : (
                <HugeiconsIcon
                  icon={File01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              )}
              <span className="truncate">{file.name}</span>
            </div>
          )
        },
      },
{
        accessorKey: "path",
        header: "Path",
        cell: ({ row }) => (
          <code className="text-xs text-muted-foreground">
            {row.original.path}
          </code>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) =>
          row.original.type === "folder" ? (
            <Badge variant="secondary">Folder</Badge>
          ) : (
            <Badge variant="outline">File</Badge>
          ),
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.type === "folder"
              ? "—"
              : formatBytes(row.original.size)}
          </span>
        ),
      },
    ],
    [expanded, toggleExpand]
  )

  const table = useTable({
    features,
    data: flatData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
  })
  if (files.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        This repository has no files on its default branch yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {flatData.length} {flatData.length === 1 ? "entry" : "entries"} shown
          {truncated ? " · truncated for performance" : null}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button {...props} type="button" variant="outline" size="sm" />
            )}
          >
            <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-4" />
            Columns
            <HugeiconsIcon
              icon={ChevronDownIcon}
              strokeWidth={2}
              className="size-4"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(Boolean(value))
                    }
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea
        className="rounded-3xl border border-border/60"
        style={{ height: maxHeight }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-medium"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <FlexRender header={header} />
                          {sorted === "asc" ? " ↑" : null}
                          {sorted === "desc" ? " ↓" : null}
                        </button>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}