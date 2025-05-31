import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const subscription = user.subscriptions[0] || null;
  return NextResponse.json({
    apiKey: subscription?.apiKey || null,
    plan: subscription?.plan || null,
    status: subscription?.status || null,
    expiresAt: subscription?.expiresAt || null,
  });
} 