import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'alerts:read');
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    const where: any = {
      organizationId: user.organizationId,
    };

    if (status) where.status = status;
    if (severity) where.severity = severity;

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        detectionRule: {
          select: { name: true, mitreTechniqueId: true, mitreTactic: true },
        },
        assignedToUser: {
          select: { id: true, name: true, email: true },
        },
        alertEvents: {
          include: {
            event: true,
          },
        },
      },
    });

    return NextResponse.json({ data: alerts });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to retrieve alerts' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'alerts:manage');
    const body = await req.json();
    const { alertId, status, assignedToUserId, notes, falsePositiveReason } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    const existing = await prisma.alert.findFirst({
      where: { id: alertId, organizationId: user.organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'ACKNOWLEDGED' && !existing.acknowledgedAt) {
        updateData.acknowledgedAt = new Date();
      }
      if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
        updateData.resolvedAt = new Date();
      }
    }
    if (assignedToUserId !== undefined) updateData.assignedToUserId = assignedToUserId;
    if (notes) updateData.investigationNotes = notes;
    if (falsePositiveReason) updateData.falsePositiveReason = falsePositiveReason;

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: updateData,
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'ALERT_STATUS_UPDATED',
      entityType: 'ALERT',
      entityId: alertId,
      safeMetadata: { oldStatus: existing.status, newStatus: status, alertTitle: existing.title },
    });

    return NextResponse.json({ success: true, alert: updated });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
