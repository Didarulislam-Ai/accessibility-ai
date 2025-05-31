import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const issue = await prisma.accessibilityIssue.findUnique({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    await prisma.accessibilityIssue.update({
      where: {
        id: params.id
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