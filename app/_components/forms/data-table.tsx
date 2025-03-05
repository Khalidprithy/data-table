"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

// Define the props for the DataTable component
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data?: TData[] // Make data optional
  pageNo?: number
  pageCount?: number
  totalItems?: number
  searchKey?: string
  onSearch?: (value: string) => void
  onPaginationChange?: (pageIndex: number, pageSize: number) => void
  onSortingChange?: (sorting: SortingState) => void
  onFilterChange?: (columnFilters: ColumnFiltersState) => void
}

export function DataTable<TData, TValue>({
  columns,
  data = [], // Provide default empty array
  pageNo = 1,
  pageCount = 1,
  totalItems = 0,
  searchKey,
  onSearch,
  onPaginationChange,
  onSortingChange,
  onFilterChange,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: pageNo - 1,
    pageSize: 10,
  })

  // Global filter state
  const [globalFilter, setGlobalFilter] = useState("")

  // Update URL with search params
  const createQueryString = (params: Record<string, string | number | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, String(value))
      }
    })

    return newSearchParams.toString()
  }

  // Handle pagination changes
  const handlePaginationChange = (pageIndex: number, pageSize: number) => {
    if (onPaginationChange) {
      onPaginationChange(pageIndex, pageSize)
    } else {
      // Update URL with pagination params
      const queryString = createQueryString({
        page: pageIndex + 1,
        limit: pageSize,
      })
      router.push(`${pathname}?${queryString}`)
    }
  }

  // Handle search changes
  const handleSearchChange = (value: string) => {
    if (onSearch) {
      onSearch(value)
    } else if (searchKey) {
      // Update URL with search params
      const queryString = createQueryString({
        search: value || null,
        page: 1, // Reset to first page on new search
      })
      router.push(`${pathname}?${queryString}`)
    }
  }

  // Handle sorting changes
  const handleSortingChange = (updatedSorting: SortingState) => {
    setSorting(updatedSorting)
    if (onSortingChange) {
      onSortingChange(updatedSorting)
    }
  }

  // Handle filter changes
  const handleFilterChange = (updatedFilters: ColumnFiltersState) => {
    setColumnFilters(updatedFilters)
    if (onFilterChange) {
      onFilterChange(updatedFilters)
    }
  }

  // Initialize the table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    pageCount: pageCount,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updatedPagination) => {
      setPagination(updatedPagination)
      handlePaginationChange(updatedPagination.pageIndex, updatedPagination.pageSize)
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: !!onSortingChange,
    manualFiltering: !!onFilterChange,
  })

  // Update pagination when pageNo changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: pageNo - 1,
    }))
  }, [pageNo])

  // Update global filter from URL search param
  useEffect(() => {
    const searchValue = searchParams.get("search") || ""
    if (searchValue !== globalFilter) {
      setGlobalFilter(searchValue)
    }
  }, [searchParams, globalFilter])

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} searchKey={searchKey} onSearchChange={handleSearchChange} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} totalItems={totalItems} />
    </div>
  )
}

