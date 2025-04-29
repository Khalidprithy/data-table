"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "");
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get("role") || "");

  // Function to update the URL with new query parameters
  const updateURLParams = (params: URLSearchParams) => {
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Update the URL whenever any of the filters change
  useEffect(() => {
    // Clone existing search parameters to preserve the old ones
    const params = new URLSearchParams(searchParams.toString());

    // Set the new search term and filter values
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search"); // Remove search parameter if it's empty

    if (statusFilter) params.set("status", statusFilter);
    else params.delete("status"); // Remove status filter if it's empty

    if (roleFilter) params.set("role", roleFilter);
    else params.delete("role"); // Remove role filter if it's empty

    // Update the URL without resetting the other query parameters
    updateURLParams(params);
  }, [searchTerm, statusFilter, roleFilter, searchParams, router]);

  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            value={statusFilter}
               // @ts-ignore
            onChange={(value) => setStatusFilter(value)}
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
            value={roleFilter}
            // @ts-ignore
            onChange={(value) => setRoleFilter(value)}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm(""); // Reset search term
              setStatusFilter(""); // Reset status filter
              setRoleFilter(""); // Reset role filter
              table.resetColumnFilters(); // Reset column filters
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
