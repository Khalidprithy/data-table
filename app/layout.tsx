import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Table",
  description: "Data table created with tanstack table and shadcn",
  authors: [
    {
      name: "Khalid"
    }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
