import { NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // Verify API key and subscription
    const isValid = await verifyApiKey(apiKey);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid API key or subscription expired' }, { status: 401 });
    }

    const { issueId, fix } = await request.json();

    if (!issueId || !fix) {
      return NextResponse.json({ error: 'Missing issueId or fix' }, { status: 400 });
    }

    // Store the fix in the database
    // This will be used to track which issues have been fixed
    // and to provide analytics in the dashboard
    await prisma.accessibilityIssue.update({
      where: { id: issueId },
      data: {
        status: 'fixed',
        fix: fix
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error fixing issue:', error);
    return NextResponse.json({ error: 'Failed to fix issue' }, { status: 500 });
  }
} 