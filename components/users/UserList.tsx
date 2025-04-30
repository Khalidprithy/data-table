"use client";

import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/users/columns";
import { useToast } from "@/hooks/use-toast";
import { saveUserOrder } from "@/lib/actions/user";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export default function UserList({ result }: { result: any }) {
  const { data, total, pageCount, page, pageSize } = result;
  const { toast } = useToast();

  const [userData, setUserData] = useState(data || []);
  const savingRef = useRef(false);
  const [isPending, startTransition] = useTransition(); // Optional: for visual feedback if needed

  useEffect(() => {
    if (!savingRef.current && JSON.stringify(data) !== JSON.stringify(userData)) {
      setUserData(data);
    }
  }, [data, userData]);

  const saveReorderedData = useCallback(
    async (reorderedData: any[]) => {
      try {
        savingRef.current = true;

        const result = await saveUserOrder(reorderedData);

        if (!result.success) {
          toast({
            title: "Error",
            description: result.message || "Failed to save the new order.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: result.message,
          });
        }
      } catch (error) {
        console.error("Error saving reordered data:", error);
        toast({
          title: "Error",
          description: "Failed to save the new order. Changes may not persist after refresh.",
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
      setUserData(newOrder);
      startTransition(() => saveReorderedData(newOrder)); 
      console.log("Reordered users:", newOrder.map((user: any) => user.id));
    },
    [saveReorderedData, startTransition]
  );

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
