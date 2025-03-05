"use client"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Users Management</h1>
      <div className="border rounded-lg p-4">
        <DataTable columns={columns} />
      </div>
    </div>
  )
}

