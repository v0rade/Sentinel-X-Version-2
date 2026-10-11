import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
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
    return NextResponse.json({ error: 'Failed to retrieve assets' }, { status: 500 });
  }
}
