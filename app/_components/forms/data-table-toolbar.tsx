"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  onSearchChange?: (value: string) => void
}

export function DataTableToolbar<TData>({ table, searchKey, onSearchChange }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchValue, setSearchValue] = useState("")

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(e.target.value)
      } else {
        table.setGlobalFilter(e.target.value)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  // Update search input when global filter changes
  useEffect(() => {
    const globalFilter = table.getState().globalFilter
    setSearchValue(typeof globalFilter === "string" ? globalFilter : "")
  }, [table.getState().globalFilter]) //Corrected dependency

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <Input
            placeholder={`Search by ${searchKey}...`}
            value={searchValue}
            onChange={handleSearchChange}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          />
        )}
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Role"
            options={[
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
              { label: "Manager", value: "manager" },
            ]}
          />
        )}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

