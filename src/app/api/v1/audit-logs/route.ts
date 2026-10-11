import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'audit:read');
    const { searchParams } = new URL(req.url);

    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));

    const logs = await prisma.auditLog.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ data: logs });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
