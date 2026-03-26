import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ threads: [], messages: [] });
  }

  const [threads, messages] = await Promise.all([
    prisma.thread.findMany({
      where: { title: { contains: q } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.message.findMany({
      where: { content: { contains: q } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { name: true } },
        thread: { select: { id: true, title: true } },
      },
    }),
  ]);

  return NextResponse.json({ threads, messages });
}
