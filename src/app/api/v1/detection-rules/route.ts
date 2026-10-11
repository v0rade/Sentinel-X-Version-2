import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'events:read');
    const rules = await prisma.detectionRule.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ data: rules });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to retrieve rules' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'alerts:manage');
    const body = await req.json();
    const { ruleId, enabled, threshold, evalWindowSecs } = body;

    const updated = await prisma.detectionRule.update({
      where: { id: ruleId },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(threshold !== undefined && { threshold }),
        ...(evalWindowSecs !== undefined && { evalWindowSecs }),
      },
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  }
}
