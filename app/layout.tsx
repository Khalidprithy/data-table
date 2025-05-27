import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/components/providers';

export const metadata: Metadata = {
  title: 'Data Table',
  description: 'Data table created with tanstack table and shadcn',
  authors: [
    {
      name: 'Khalid',
    },
  ],
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
