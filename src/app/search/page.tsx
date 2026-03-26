"use client";

import { useState } from "react";
import Link from "next/link";

interface SearchThread {
  id: string;
  title: string;
  updatedAt: string;
}

interface SearchMessage {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
  thread: { id: string; title: string };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<SearchThread[]>([]);
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setThreads(data.threads);
      setMessages(data.messages);
      setSearched(true);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
        &larr; Tilbake
      </Link>

      <h1 className="mt-4 mb-4 text-xl font-bold text-gray-900">Sok</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sok i trader og meldinger..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Sok
        </button>
      </form>

      {searched && threads.length === 0 && messages.length === 0 && (
        <p className="text-gray-500">Ingen resultater for &quot;{query}&quot;</p>
      )}

      {threads.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 font-semibold text-gray-900">Trader</h2>
          <div className="space-y-2">
            {threads.map((t) => (
              <Link
                key={t.id}
                href={`/threads/${t.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
              >
                <p className="font-medium text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-400">
                  {new Date(t.updatedAt).toLocaleDateString("no-NO")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-gray-900">Meldinger</h2>
          <div className="space-y-2">
            {messages.map((m) => (
              <Link
                key={m.id}
                href={`/threads/${m.thread.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
              >
                <p className="text-xs text-gray-500">
                  {m.author.name} i &quot;{m.thread.title}&quot;
                </p>
                <p className="mt-1 text-sm text-gray-900">{m.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(m.createdAt).toLocaleString("no-NO")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
