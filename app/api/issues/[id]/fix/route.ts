import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>; // Changed from { id: string } to Promise<{ id: string }>
};

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params; // Added 'await' here

    const issue = await prisma.accessibilityIssue.findUnique({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    await prisma.accessibilityIssue.update({
      where: {
        id: id
      },
      data: {
        status: 'fixed',
        fixedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking issue as fixed:', error);
    return NextResponse.json({ error: 'Failed to mark issue as fixed' }, { status: 500 });
  }
}