import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'incidents:read');
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    const where: any = {
      organizationId: user.organizationId,
    };

    if (status) where.status = status;
    if (severity) where.severity = severity;

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedToUser: { select: { id: true, name: true, email: true } },
        alerts: { select: { id: true, title: true, severity: true, status: true } },
        timelineEntries: { orderBy: { timestamp: 'asc' } },
        tasks: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ data: incidents });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to retrieve incidents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'incidents:manage');
    const body = await req.json();
    const { title, description, severity, affectedAssets, alertIds } = body;

    if (!title || !description || !severity) {
      return NextResponse.json({ error: 'Title, description, and severity are required' }, { status: 400 });
    }

    const count = await prisma.incident.count({ where: { organizationId: user.organizationId } });
    const ref = `INC-2026-${String(count + 1).padStart(4, '0')}`;

    const incident = await prisma.incident.create({
      data: {
        organizationId: user.organizationId,
        referenceNumber: ref,
        title,
        description,
        severity,
        status: 'OPEN',
        affectedAssets: affectedAssets || 'Enterprise Assets',
        assignedToUserId: user.id,
        timelineEntries: {
          create: [
            {
              actionType: 'STATUS_CHANGE',
              title: 'Incident Declared',
              details: `Incident ${ref} opened by ${user.name} (${user.role}).`,
              actorName: user.name,
            },
          ],
        },
        tasks: {
          create: [
            { title: 'Validate alert evidence and scope', sortOrder: 1, assignedToUserId: user.id },
            { title: 'Isolate affected accounts or endpoints', sortOrder: 2 },
            { title: 'Preserve forensic logs and timeline', sortOrder: 3 },
            { title: 'Document root cause and remediation retrospective', sortOrder: 4 },
          ],
        },
      },
    });

    // Link alerts if provided
    if (Array.isArray(alertIds) && alertIds.length > 0) {
      await prisma.alert.updateMany({
        where: { id: { in: alertIds }, organizationId: user.organizationId },
        data: { incidentId: incident.id, status: 'INVESTIGATING' },
      });
    }

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'INCIDENT_CREATED',
      entityType: 'INCIDENT',
      entityId: incident.id,
      safeMetadata: { reference: ref, severity, title },
    });

    return NextResponse.json({ success: true, incident }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'incidents:manage');
    const body = await req.json();
    const { incidentId, status, taskUpdates, noteToAdd } = body;

    if (!incidentId) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    const incident = await prisma.incident.findFirst({
      where: { id: incidentId, organizationId: user.organizationId },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const updates: any = {};
    if (status && status !== incident.status) {
      updates.status = status;
      if (status === 'CONTAINMENT') updates.containedAt = new Date();
      if (status === 'CLOSED') updates.closedAt = new Date();

      await prisma.incidentTimelineEntry.create({
        data: {
          incidentId,
          actionType: 'STATUS_CHANGE',
          title: `Status Changed to ${status}`,
          details: `Incident status transitioned from ${incident.status} to ${status}.`,
          actorName: user.name,
        },
      });
    }

    if (noteToAdd) {
      await prisma.incidentTimelineEntry.create({
        data: {
          incidentId,
          actionType: 'NOTE_ADDED',
          title: 'Investigation Note',
          details: noteToAdd,
          actorName: user.name,
        },
      });
    }

    if (taskUpdates && Array.isArray(taskUpdates)) {
      for (const t of taskUpdates) {
        await prisma.incidentTask.update({
          where: { id: t.taskId },
          data: {
            isCompleted: t.isCompleted,
            completedAt: t.isCompleted ? new Date() : null,
          },
        });
      }
    }

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: updates,
      include: {
        timelineEntries: { orderBy: { timestamp: 'asc' } },
        tasks: { orderBy: { sortOrder: 'asc' } },
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'INCIDENT_UPDATED',
      entityType: 'INCIDENT',
      entityId: incidentId,
      safeMetadata: { newStatus: status, reference: incident.referenceNumber },
    });

    return NextResponse.json({ success: true, incident: updated });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}
