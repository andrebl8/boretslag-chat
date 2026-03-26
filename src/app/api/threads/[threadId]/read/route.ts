import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;

  await prisma.threadRead.upsert({
    where: {
      userId_threadId: {
        userId: session.user.id,
        threadId,
      },
    },
    update: { readAt: new Date() },
    create: {
      userId: session.user.id,
      threadId,
      readAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
