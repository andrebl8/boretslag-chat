"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
}

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { data: session } = useSession();
  const [thread, setThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadThread() {
    const res = await fetch(`/api/threads/${threadId}/messages`);
    if (res.ok) {
      setThread(await res.json());
    }
  }

  useEffect(() => {
    loadThread();

    fetch(`/api/threads/${threadId}/read`, { method: "POST" });

    const interval = setInterval(loadThread, 5000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);

    const res = await fetch(`/api/threads/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      setNewMessage("");
      await loadThread();
      fetch(`/api/threads/${threadId}/read`, { method: "POST" });
    }

    setSending(false);
  }

  if (!thread) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Laster...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-4xl flex-col">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Tilbake
        </Link>
        <h1 className="mt-1 text-lg font-bold text-gray-900">{thread.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {thread.messages.map((msg) => {
            const isMe = msg.author.id === session?.user?.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isMe
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {!isMe && (
                    <p className="mb-1 text-xs font-semibold text-gray-600">
                      {msg.author.name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`mt-1 text-xs ${
                      isMe ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleString("no-NO")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 bg-white p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv en melding..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
