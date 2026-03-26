import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const threads = await prisma.thread.findMany({
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      threadRead: {
        where: { userId },
      },
      _count: { select: { messages: true } },
    },
  });

  const unreadThreads = threads.filter((thread) => {
    const lastMessage = thread.messages[0];
    if (!lastMessage) return false;

    const lastRead = thread.threadRead[0]?.readAt;
    if (!lastRead) return true;

    return lastMessage.createdAt > lastRead;
  });

  return NextResponse.json({
    unreadCount: unreadThreads.length,
    unreadThreadIds: unreadThreads.map((t) => t.id),
  });
}
