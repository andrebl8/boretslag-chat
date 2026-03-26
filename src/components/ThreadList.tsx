"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: { content: string; author: { name: string }; createdAt: string }[];
  _count: { messages: number };
}

export default function ThreadList() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const [threadsRes, notifsRes] = await Promise.all([
        fetch("/api/threads"),
        fetch("/api/notifications"),
      ]);

      if (threadsRes.ok) setThreads(await threadsRes.json());
      if (notifsRes.ok) {
        const data = await notifsRes.json();
        setUnreadIds(data.unreadThreadIds || []);
      }
    }

    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (threads.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        Ingen trader enna. Opprett den forste!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const lastMsg = thread.messages[0];
        const isUnread = unreadIds.includes(thread.id);

        return (
          <Link
            key={thread.id}
            href={`/threads/${thread.id}`}
            className={`block rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
              isUnread ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-900"}`}>
                  {isUnread && (
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
                  )}
                  {thread.title}
                </h3>
                {lastMsg && (
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {lastMsg.author.name}: {lastMsg.content}
                  </p>
                )}
              </div>
              <div className="ml-4 flex flex-col items-end text-xs text-gray-400">
                <span>{new Date(thread.updatedAt).toLocaleDateString("no-NO")}</span>
                <span>{thread._count.messages} meldinger</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
