"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session) return;

    async function fetchNotifications() {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Borretslag Chat
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sok
          </Link>
          <span className="text-sm text-gray-600">{session.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logg ut
          </button>
        </div>
      </div>
    </header>
  );
}
