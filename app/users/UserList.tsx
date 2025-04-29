"use client";

import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/users/columns";
import { useEffect, useState } from "react";

export default function UserList({ result }: { result: any[] }) {
  

  const { data, total, pageCount, page, pageSize } = result;

  const [userData, setUserData] = useState(data || []);

  useEffect(() => {
    // Re-fetch or update data if page or pageSize changes
    setUserData(data);  // If the page data changes, update userData
  }, [data]);

  const handleDragEnd = (newOrder: typeof data) => {
    console.log("Reordered users:", newOrder);
    setUserData(newOrder);
  };


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Users Management</h1>
      <div className="border rounded-lg p-4">
        <DataTable
          columns={columns}
          paginationData={{
            total, 
            pageCount,
            page,
            pageSize,
          }}
          data={userData}
          enableRowOrdering
          dragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
}
