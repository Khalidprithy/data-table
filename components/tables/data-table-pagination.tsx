"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCallback, useEffect } from "react"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalItems?: number
}

export function DataTablePagination<TData>({ table, totalItems = 0 }: DataTablePaginationProps<TData>) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const pageCount = table.getPageCount()

  // Function to update URL with new pagination parameters
  const updateURL = useCallback(
    (newPage: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(newPage + 1)) // Convert to 1-based for URL
      params.set("pageSize", String(newPageSize))
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams],
  )

  // Handle page navigation
  const goToPage = useCallback(
    (newPage: number) => {
      table.setPageIndex(newPage)
      updateURL(newPage, pageSize)
    },
    [table, pageSize, updateURL],
  )

  // Handle page size change
  const changePageSize = useCallback(
    (newPageSize: number) => {
      const newPageIndex = Math.floor((pageIndex * pageSize) / newPageSize)
      table.setPageSize(newPageSize)
      table.setPageIndex(newPageIndex)
      updateURL(newPageIndex, newPageSize)
    },
    [table, pageIndex, pageSize, updateURL],
  )

  // Update URL when pagination state changes from other sources
  useEffect(() => {
    const currentPage = Number(searchParams.get("page")) || 1
    const currentPageSize = Number(searchParams.get("pageSize")) || 10

    // Only update if there's a mismatch between URL and state
    if (currentPage !== pageIndex + 1 || currentPageSize !== pageSize) {
      updateURL(pageIndex, pageSize)
    }
  }, [pageIndex, pageSize, searchParams, updateURL])

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </span>
        ) : (
          <span>Total {totalItems} items</span>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select value={`${pageSize}`} onValueChange={(value) => changePageSize(Number(value))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {pageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => goToPage(0)}
            disabled={pageIndex === 0}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex >= pageCount - 1}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => goToPage(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
