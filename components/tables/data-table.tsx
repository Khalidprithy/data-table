'use client'

import {
   type ColumnDef,
   type ColumnFiltersState,
   type SortingState,
   type VisibilityState,
   type Row,
   type RowData,
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   useReactTable
} from '@tanstack/react-table'

import {
   closestCenter,
   DndContext,
   DragOverlay,
   PointerSensor,
   useSensor,
   useSensors,
   type DragEndEvent,
   type DragStartEvent
} from '@dnd-kit/core'

import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'


import { DataTableToolbar } from './data-table-toolbar'
import { DataTablePagination } from './data-table-pagination'
import { Button } from '../ui/button'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchableFields?: string[];
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

interface DragHandleProps {
   listeners: ReturnType<typeof useSortable>['listeners']
   attributes: ReturnType<typeof useSortable>['attributes']
}

interface SortableRowProps<TData extends RowData> {
   row: Row<TData>
   isDragging?: boolean
}

function DragHandle({ listeners, attributes }: DragHandleProps) {
   return (
      <div
         className="flex h-full w-full cursor-grab items-center justify-center bg-transparent"
         {...listeners}
         {...attributes}
      >
         <Button size="icon" variant="outline" className="mr-2">
            <GripVertical className="h-4 w-4" aria-hidden="true" />
         </Button>
      </div>
   )
}

const SortableRow = React.memo(function SortableRow<TData extends RowData>({
   row,
   isDragging
}: SortableRowProps<TData>) {
   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id })

   const style = useMemo(
      () => ({
         transform: CSS.Transform.toString(transform),
         transition,
         opacity: isDragging ? 0.5 : 1,
         position: 'relative' as const,
         zIndex: isDragging ? 1 : 0
      }),
      [transform, transition, isDragging]
   )

   return (
      <TableRow
         ref={setNodeRef}
         style={style}
         data-state={(row.getIsSelected() && 'selected') || (isDragging && 'dragging') || undefined}
         className={isDragging ? 'bg-muted' : ''}
      >
         {row.getVisibleCells().map(cell => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
         ))}
         <TableCell className="w-4 p-0 text-gray-400">
            <DragHandle listeners={listeners} attributes={attributes} />
         </TableCell>
      </TableRow>
   )
})

const DragOverlayRow = React.memo(function DragOverlayRow<TData extends RowData>({ row }: { row: Row<TData> }) {
   return (
      <TableRow className="border bg-background shadow-md">
         {row.getVisibleCells().map(cell => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
         ))}
         <TableCell className="w-4">
            <Button size="icon" variant="outline" className="mr-2">
               <GripVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
         </TableCell>
      </TableRow>
   )
})

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  searchableFields = [],
  paginationData,
  enableRowOrdering = false,
  dragEnd,
}: DataTableProps<TData, TValue>) {
   const dataRef = React.useRef(initialData)
   const paginationDataRef = React.useRef(paginationData)

   const [data, setData] = useState<TData[]>(initialData)
   const [sorting, setSorting] = useState<SortingState>([])
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
   const [rowSelection, setRowSelection] = useState({})
   const [pagination, setPagination] = useState({
      pageIndex: paginationData?.page ? paginationData.page - 1 : 0,
      pageSize: paginationData?.pageSize || 10
   })
   const [globalFilter, setGlobalFilter] = useState('')
   const [activeId, setActiveId] = useState<string | null>(null)

   useEffect(() => {
      if (
         JSON.stringify(initialData) !== JSON.stringify(dataRef.current) ||
         JSON.stringify(paginationData) !== JSON.stringify(paginationDataRef.current)
      ) {
         if (initialData !== dataRef.current) {
            setData(initialData)
            dataRef.current = initialData
         }

         if (paginationData !== paginationDataRef.current) {
            setPagination({
               pageIndex: paginationData?.page ? paginationData.page - 1 : 0,
               pageSize: paginationData?.pageSize || 10
            })
            paginationDataRef.current = paginationData
         }
      }
   }, [initialData, paginationData])

   const totalRows = paginationData?.total || 0
   const pageCount = useMemo(
      () => paginationData?.pageCount || Math.ceil(totalRows / pagination.pageSize),
      [paginationData, totalRows, pagination.pageSize]
   )

   const table = useReactTable({
      data,
      columns,
      state: {
         sorting,
         columnFilters,
         columnVisibility,
         rowSelection,
         pagination,
         globalFilter
      },
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onPaginationChange: setPagination,
      onGlobalFilterChange: setGlobalFilter,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      manualPagination: true,
      pageCount: pageCount
   })

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: { distance: 3 }
      })
   )

   const currentRows = table?.getRowModel()?.rows

   const activeRow = useMemo(() => {
      if (!activeId) return null
      return currentRows.find(row => row.id === activeId) || null
   }, [activeId, currentRows])

   const rowIds = useMemo(() => currentRows.map(row => row.id), [currentRows])

   const handleDragStart = useCallback((event: DragStartEvent) => {
      setActiveId(event.active.id as string)
   }, [])

   const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
         const { active, over } = event
         setActiveId(null)

         if (!over || active.id === over.id) return

         const oldIndex = currentRows.findIndex(row => row.id === active.id)
         const newIndex = currentRows.findIndex(row => row.id === over.id)

         if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove([...data], oldIndex, newIndex)
            setData(newData)
            dragEnd?.(newData)
         }
      },
      [currentRows, data, dragEnd]
   )

   const tableHeader = (
      <TableHeader>
         {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
               {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                     {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
               ))}
               {enableRowOrdering && <TableHead className="w-4" />}
            </TableRow>
         ))}
      </TableHeader>
   )

   const renderSkeletonRows = () => {
      const skeletonRows = Array.from({ length: 10 })

      return skeletonRows.map((_, rowIndex) => (
         <TableRow key={rowIndex}>
            {columns.map((_, colIndex) => (
               <TableCell key={colIndex}>
                  <Skeleton className="h-10 w-full" />
               </TableCell>
            ))}
            {enableRowOrdering && (
               <TableCell className="w-4">
                  <Skeleton className="h-10 w-5" />
               </TableCell>
            )}
         </TableRow>
      ))
   }

   const emptyTableBody = (
      <TableRow>
         <TableCell colSpan={columns.length + (enableRowOrdering ? 1 : 0)} className="h-24 text-center">
            No results.
         </TableCell>
      </TableRow>
   )

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} searchableFields={searchableFields} />
      <div className="rounded-md border">
        {enableRowOrdering ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="sr-only" id="dnd-description">
              Drag and drop to reorder rows. Press space or enter to start
              dragging, and space or enter again to drop.
            </div>
            <Table>
              {tableHeader}
              <TableBody>
                {currentRows.length === 0 ? (
                  emptyTableBody
                ) : (
                  <SortableContext
                    items={rowIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {currentRows.map((row) => (
                      <SortableRow
                        key={row.id}
                        row={row}
                        isDragging={activeId === row.id}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>

            <DragOverlay>
              {activeRow ? (
                <div className="table-wrapper">
                  <table className="w-full">
                    <tbody>
                      <DragOverlayRow row={activeRow} />
                    </tbody>
                  </table>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <Table>
            {tableHeader}
            <TableBody>
              {currentRows.length === 0
                ? emptyTableBody
                : currentRows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                      {enableRowOrdering && (
                        <TableCell className="w-4">
                          <Button variant="outline" className="h-5 w-5 p-1">
                            <GripVertical
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        )}
      </div>
      <DataTablePagination table={table} totalItems={totalRows} />
    </div>
  );
}
