'use client';

import {
  useQueryClient,
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query';
import React, { useState } from 'react';

export default function TanstackProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
