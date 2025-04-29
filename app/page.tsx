"use client";

import { DataTable } from "../components/tables/data-table";
import { columns } from "../components/tables/users/columns";

export default async function UsersPage() {

  const res = await fetch("http://localhost:3000/api/users", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const { data: users } = await res.json();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Users Management
      </h1>
      <div className="border rounded-lg p-4">
        <DataTable columns={columns} data={users} />
      </div>
    </div>
  );
}
