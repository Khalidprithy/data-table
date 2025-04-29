"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  paginationData?: {
    total: number;
    pageCount: number;
    page: number;
    pageSize: number;
  };
  enableSorting?: boolean;
  enableFilters?: boolean;
  enableRowOrdering?: boolean;
  dragEnd?: (newData: TData[]) => void;
}

function SortableRow({ row, children }: { row: any; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      {...attributes}
      {...listeners}
    >
      {children}
    </TableRow>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  paginationData,
  enableRowOrdering = false,
  dragEnd,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState<TData[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: paginationData?.page || 0,
    pageSize: paginationData?.pageSize || 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");

  const totalRows = paginationData?.total || 0;
  const pageCount = paginationData?.pageCount || 0;

  // Ensure pagination state gets updated when the component receives new data or pagination state
  useEffect(() => {
    if (paginationData) {
      setPagination({
        pageIndex: paginationData.page || 0,
        pageSize: paginationData.pageSize || 10,
      });
      setData(initialData || []);
    }
  }, [paginationData]);

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
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (newState) => {
      setPagination(newState); // Properly update pagination when it changes
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  });

  const sensors = useSensors(useSensor(PointerSensor));
  const currentRows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {enableRowOrdering && <TableHead className="w-4" />}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {currentRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (enableRowOrdering ? 1 : 0)} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : enableRowOrdering ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (active.id !== over?.id) {
                    const oldIndex = currentRows.findIndex((row) => row.id === active.id);
                    const newIndex = currentRows.findIndex((row) => row.id === over?.id);
                    const newData = arrayMove(data, oldIndex, newIndex);
                    setData(newData);
                    dragEnd?.(newData);
                  }
                }}
              >
                <SortableContext items={currentRows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
                  {currentRows.map((row) => (
                    <SortableRow key={row.id} row={row}>
                      <TableCell className="w-4 text-gray-400 cursor-grab">
                        <GripVertical className="h-4 w-4" />
                      </TableCell>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </SortableRow>
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              currentRows.map((row) => (
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
      <DataTablePagination table={table} />
    </div>
  );
}
