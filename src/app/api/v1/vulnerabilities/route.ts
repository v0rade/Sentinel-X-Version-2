import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'vulnerabilities:read');
    const { searchParams } = new URL(req.url);

    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    const where: any = { organizationId: user.organizationId };
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const vulns = await prisma.vulnerabilityFinding.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { cvssScore: 'desc' }],
      include: {
        asset: { select: { id: true, name: true, criticality: true, environment: true } },
        application: { select: { id: true, name: true, securityScore: true } },
        assignedEngineer: { select: { id: true, name: true, email: true } },
        remediationTasks: true,
      },
    });

    return NextResponse.json({ data: vulns });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to retrieve vulnerabilities' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'vulnerabilities:manage');
    const body = await req.json();
    const { id, status, riskAcceptedReason, assignedEngineerId } = body;

    if (!id) return NextResponse.json({ error: 'Finding ID required' }, { status: 400 });

    const vuln = await prisma.vulnerabilityFinding.findFirst({
      where: { id, organizationId: user.organizationId },
    });

    if (!vuln) return NextResponse.json({ error: 'Vulnerability finding not found' }, { status: 404 });

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'ACCEPTED_RISK') {
        if (!riskAcceptedReason || riskAcceptedReason.trim().length < 10) {
          return NextResponse.json({ error: 'A detailed risk acceptance justification is mandatory' }, { status: 400 });
        }
        updateData.riskAcceptedReason = riskAcceptedReason;
      }
      if (status === 'FIXED') {
        updateData.verifiedAt = new Date();
      }
    }

    if (assignedEngineerId !== undefined) {
      updateData.assignedEngineerId = assignedEngineerId;
    }

    const updated = await prisma.vulnerabilityFinding.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      action: status === 'ACCEPTED_RISK' ? 'VULN_RISK_ACCEPTED' : 'VULN_STATUS_UPDATED',
      entityType: 'VULNERABILITY',
      entityId: id,
      safeMetadata: { reference: vuln.findingReference, oldStatus: vuln.status, newStatus: status },
    });

    return NextResponse.json({ success: true, vulnerability: updated });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to update vulnerability' }, { status: 500 });
  }
}
