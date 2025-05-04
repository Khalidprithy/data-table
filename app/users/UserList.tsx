"use client";

import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/users/columns";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function UserList({ result }: { result: any }) {
  const { data, total, pageCount, page, pageSize } = result;
  const { toast } = useToast();

  const [userData, setUserData] = useState(data || []);

  // Use a ref to track if a save operation is in progress
  const savingRef = useRef(false);

  useEffect(() => {
    // Only update if data has changed and we're not in the middle of a save operation
    if (
      !savingRef.current &&
      JSON.stringify(data) !== JSON.stringify(userData)
    ) {
      setUserData(data);
    }
  }, [data, userData]);

  // Function to save the reordered data to the server
  const saveReorderedData = useCallback(
    async (reorderedData: any[]) => {
      try {
        savingRef.current = true;

        const response = await fetch("/api/users/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ users: reorderedData }),
        });

        const result = await response.json();

        if (!result.success) {
          console.error("Failed to save reordered data:", result.message);
          toast({
            title: "Error",
            description:
              "Failed to save the new order. Changes may not persist after refresh.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "User order updated successfully",
          });
        }
      } catch (error) {
        console.error("Error saving reordered data:", error);
        toast({
          title: "Error",
          description:
            "Failed to save the new order. Changes may not persist after refresh.",
          variant: "destructive",
        });
      } finally {
        savingRef.current = false;
      }
    },
    [toast]
  );

  const handleDragEnd = useCallback(
    (newOrder: typeof data) => {
      // Update the UI immediately (optimistic update)
      setUserData(newOrder);

      // Save the new order to the server without waiting for it to complete
      saveReorderedData(newOrder);

      // Log the reordered data
      console.log(
        "Reordered users:",
        newOrder.map((user: any) => user.id)
      );
    },
    [saveReorderedData]
  );


  const paginationData = useMemo(
    () => ({
       total: total,
       pageCount: pageCount,
       page: page,
       pageSize: pageSize
    }),
    [total, pageCount, page, pageSize]
 )


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Users Management
      </h1>
      <div className="border rounded-lg p-4">
        <DataTable
          columns={columns}
          paginationData={paginationData}
          data={userData}
          enableRowOrdering
          dragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
}
