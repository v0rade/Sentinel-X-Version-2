import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'threat_intel:read');
    const indicators = await prisma.threatIndicator.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { firstSeen: 'desc' },
    });

    return NextResponse.json({ data: indicators });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to retrieve threat indicators' }, { status: 500 });
  }
}
