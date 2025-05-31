import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const issues = await prisma.accessibilityIssue.findMany({
      where: {
        userId: session.user.id,
        status: 'open'
      },
      orderBy: {
        severity: 'desc'
      }
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
} 