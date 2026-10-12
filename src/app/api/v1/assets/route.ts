import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'threat-intel') {
      const user = await requireAuth(req, 'threat_intel:read');
      const indicators = await prisma.threatIndicator.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { firstSeen: 'desc' },
      });
      return NextResponse.json({ data: indicators });
    }

    // Default: assets
    const user = await requireAuth(req, 'assets:read');
    const assets = await prisma.asset.findMany({
      where: { organizationId: user.organizationId },
      include: {
        vulnerabilities: {
          select: { id: true, severity: true, status: true },
        },
      },
      orderBy: { criticality: 'desc' },
    });

    return NextResponse.json({ data: assets });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to retrieve records' }, { status: 500 });
  }
}
