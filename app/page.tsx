import Link from 'next/link';
import React from 'react';

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold p-5">Data Table Examples</h1>

      <div>
        <Link href="/products">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Go to Products
          </button>
        </Link>
        <Link href="/users">
          <button className="bg-green-500 text-white px-4 py-2 rounded ml-2">
            Go to Users
          </button>
        </Link>
      </div>
    </div>
  );
}
