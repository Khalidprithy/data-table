'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

export default function ProductAction({ product }: { product: Product }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(product.sku)}
        >
          Copy SKU
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(product.meta.barcode)}
        >
          Copy Barcode
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View product</DropdownMenuItem>
        <DropdownMenuItem>Edit product</DropdownMenuItem>
        <DropdownMenuItem>Delete product</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
