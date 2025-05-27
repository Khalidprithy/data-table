'use client';

import { getProducts } from '@/components/store/client/products';
import { DataTable } from '@/components/tables/data-table';
import { columns } from '@/components/tables/products/columns';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';

export default function ProductList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { page, pageSize, search } = searchParams || {};

  const pageNo = Number(page) || 1;
  const pageSizes = Number(pageSize) || 10;
  const query = Array.isArray(search) ? search.join(',') : search || '';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', query, pageNo, pageSizes],
    queryFn: () => getProducts({ query, page: pageNo, pageSize: pageSizes }),
  });

  const paginationData = useMemo(
    () => ({
      total: data?.total || 0,
      pageCount: data?.pageCount || 0,
      page: pageNo,
      pageSize: pageSizes,
    }),
    [data?.total, data?.pageCount, pageNo, pageSizes]
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Products Management
      </h1>
      <DataTable
        columns={columns}
        paginationData={paginationData}
        data={data?.products || []}
        loading={isLoading}
      />
    </div>
  );
}
