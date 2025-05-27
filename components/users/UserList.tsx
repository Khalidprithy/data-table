'use client';

import { DataTable } from '@/components/tables/data-table';
import { columns } from '@/components/tables/users/columns';
import { useToast } from '@/hooks/use-toast';
import { saveUserOrder } from '@/lib/actions/user';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '../ui/button';

export default function UserList({ result }: { result: any }) {
  const { data, total, pageCount, page, pageSize } = result;
  const { toast } = useToast();

  const [userData, setUserData] = useState(data || []);
  const [isLoading, setIsLoading] = useState(false);
  const savingRef = useRef(false);
  const [isPending, startTransition] = useTransition();

  // Define searchable fields for the user table
  const searchableFields = ['name', 'email', 'id', 'role', 'status'];

  useEffect(() => {
    if (
      !savingRef.current &&
      JSON.stringify(data) !== JSON.stringify(userData)
    ) {
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
            title: 'Error',
            description: result.message || 'Failed to save the new order.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: result.message,
          });
        }
      } catch (error) {
        console.error('Error saving reordered data:', error);
        toast({
          title: 'Error',
          description:
            'Failed to save the new order. Changes may not persist after refresh.',
          variant: 'destructive',
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
      // Use startTransition for non-urgent updates
      startTransition(() => {
        saveReorderedData(newOrder);
      });
      console.log(
        'Reordered users:',
        newOrder.map((user: any) => user.id)
      );
    },
    [saveReorderedData]
  );

  // Simulate loading for demonstration purposes
  const refreshData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
        <Button variant={'default'} size={'sm'} onClick={() => refreshData()}>
          Refresh
        </Button>
      </div>
      <div className="border rounded-lg p-4 bg-card">
        <DataTable
          loading={isLoading || isPending}
          columns={columns}
          paginationData={{
            total,
            pageCount,
            page,
            pageSize,
          }}
          data={userData}
          enableRowOrdering
          searchableFields={searchableFields}
          dragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
}
