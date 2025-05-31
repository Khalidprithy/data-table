'use client';

import type { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState<string>(
    searchParams.get('search') || ''
  );
  const statusColumn = table.getColumn('status');
  const roleColumn = table.getColumn('role');

  // Initialize filters from URL
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const roleParam = searchParams.get('role');

    if (statusColumn && statusParam) {
      statusColumn.setFilterValue([statusParam]);
    }
    if (roleColumn && roleParam) {
      roleColumn.setFilterValue([roleParam]);
    }
  }, []);

  // Function to update the URL with new query parameters
  const updateURLParams = (params: URLSearchParams) => {
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Update the URL whenever any of the filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const statusFilter = statusColumn?.getFilterValue() as string[] | undefined;
    const roleFilter = roleColumn?.getFilterValue() as string[] | undefined;

    if (searchTerm) params.set('search', searchTerm);
    else params.delete('search');

    if (statusFilter?.[0]) params.set('status', statusFilter[0]);
    else params.delete('status');

    if (roleFilter?.[0]) params.set('role', roleFilter[0]);
    else params.delete('role');

    updateURLParams(params);
  }, [
    searchTerm,
    statusColumn?.getFilterValue(),
    roleColumn?.getFilterValue(),
    searchParams,
    router,
  ]);

  const isFiltered = table.getState().columnFilters.length > 0 || searchTerm;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-10 max-w-sm"
        />
        {statusColumn && (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />
        )}
        {roleColumn && (
          <DataTableFacetedFilter
            column={roleColumn}
            title="Role"
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
              { label: 'Manager', value: 'manager' },
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              statusColumn?.setFilterValue(undefined);
              roleColumn?.setFilterValue(undefined);
              table.resetColumnFilters();
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
