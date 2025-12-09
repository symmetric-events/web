"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface EditButtonProps {
  collection: string;
  id: string | number;
  isAuthenticated?: boolean;
}

export function EditButton({ collection, id, isAuthenticated: serverAuth }: EditButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(serverAuth ?? false);

  useEffect(() => {
    // If server-side auth is provided, use it; otherwise check client-side
    if (serverAuth !== undefined) {
      setIsAuthenticated(serverAuth);
      return;
    }

    // Fallback: Check if user is authenticated by checking for Payload auth cookie
    const checkAuth = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("payload-token="));
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, [serverAuth]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="absolute right-5 top-18 flex">
      <Link
        href={`/admin/collections/${collection}/${id}`}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0zM15 6l3 3m-5 11h8"
          />
        </svg>
        Edit in Admin
      </Link>
    </div>
  );
}

