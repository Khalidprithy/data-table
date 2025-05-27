import React from 'react';
import ProductList from './ProductList';

export default function page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {


  return (
    <div>
      <ProductList searchParams={searchParams} />
    </div>
  );
}
