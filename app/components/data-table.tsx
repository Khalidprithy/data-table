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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

// Define the data type
interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt: string
}

// Define the props for the DataTable component
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ columns }: DataTableProps<TData, TValue>) {
  // State for table data and loading status
  const [data, setData] = useState<TData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalRows, setTotalRows] = useState(0)

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map((column) => column.id as string))

  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Global filter state
  const [globalFilter, setGlobalFilter] = useState("")

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  )

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
      columnOrder,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalRows / pagination.pageSize),
  })

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Construct query parameters
        const params = new URLSearchParams({
          page: (pagination.pageIndex + 1).toString(),
          pageSize: pagination.pageSize.toString(),
          search: globalFilter,
        })

        // Add sorting parameters
        if (sorting.length > 0) {
          params.append("sortBy", sorting[0].id)
          params.append("sortOrder", sorting[0].desc ? "desc" : "asc")
        }

        // Add filter parameters
        columnFilters.forEach((filter) => {
          params.append(`filter[${filter.id}]`, filter.value as string)
        })

        // Make the API request
        const response = await fetch(`/api/users?${params.toString()}`)
        const result = await response.json()

        setData(result.data)
        setTotalRows(result.total)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pagination, sorting, columnFilters, globalFilter])

  // Handle DnD end
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id)
      const newIndex = columnOrder.indexOf(over.id)

      const newColumnOrder = [...columnOrder]
      newColumnOrder.splice(oldIndex, 1)
      newColumnOrder.splice(newIndex, 0, active.id)

      setColumnOrder(newColumnOrder)
    }
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />

      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                  {table
                    .getHeaderGroups()
                    .map((headerGroup) =>
                      headerGroup.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} table={table} />
                      )),
                    )}
                </SortableContext>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

// Draggable header component
function DraggableTableHeader({ header, table }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    zIndex: isDragging ? 1 : 0,
    cursor: "grab",
    touchAction: "none",
  }

  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  )
}

