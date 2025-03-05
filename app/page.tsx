"use client";

import { columns } from "../components/tables/users/columns";
import { DataTable } from "../components/tables/data-table";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Users Management
      </h1>
      <div className="border rounded-lg p-4">
        <DataTable columns={columns} />
      </div>
    </div>
  );
}
