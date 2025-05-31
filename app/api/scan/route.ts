import { NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth';
import { scanAccessibility } from '@/lib/accessibility-scanner';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // Verify API key and subscription, and get plan
    const { isValid, plan } = await verifyApiKey(apiKey);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid API key or subscription expired' }, { status: 401 });
    }

    const { html } = await request.json();

    // Determine scan level based on plan
    const scanLevel = plan === 'enterprise' ? 'full' : 'standard';

    // Scan the page for accessibility issues, passing the scan level
    const issues = await scanAccessibility(html, scanLevel);

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Error scanning page:', error);
    return NextResponse.json({ error: 'Failed to scan page' }, { status: 500 });
  }
} 