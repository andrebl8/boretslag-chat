import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const threads = await prisma.thread.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { author: { select: { name: true } } },
      },
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(threads);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, message } = await request.json();
  if (!title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Title and message required" }, { status: 400 });
  }

  const thread = await prisma.thread.create({
    data: {
      title: title.trim(),
      messages: {
        create: {
          content: message.trim(),
          authorId: session.user.id,
        },
      },
    },
  });

  return NextResponse.json(thread, { status: 201 });
}
