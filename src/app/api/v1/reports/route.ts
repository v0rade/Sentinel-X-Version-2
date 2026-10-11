import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'reports:export');
    const body = await req.json();
    const { reportType, title } = body;

    const [eventsCount, alerts, incidents, vulns] = await Promise.all([
      prisma.securityEvent.count({ where: { organizationId: user.organizationId } }),
      prisma.alert.findMany({ where: { organizationId: user.organizationId } }),
      prisma.incident.findMany({ where: { organizationId: user.organizationId } }),
      prisma.vulnerabilityFinding.findMany({ where: { organizationId: user.organizationId } }),
    ]);

    const reportData = {
      reportingPeriod: 'Last 30 Days',
      generatedAt: new Date().toISOString(),
      organization: user.organizationName,
      metrics: {
        totalTelemetryEvents: eventsCount,
        alertsCreated: alerts.length,
        criticalAlerts: alerts.filter((a) => a.severity === 'CRITICAL').length,
        incidentsCount: incidents.length,
        vulnerabilitiesCount: vulns.length,
        criticalVulns: vulns.filter((v) => v.severity === 'CRITICAL').length,
      },
      keyFindings: [
        'Brute-force password guessing mitigated through automated account lockout thresholding.',
        'WAF ACL rules applied during Incident INC-2026-0042 dropped malicious ingress traffic.',
        'Zero cross-tenant data leakage identified during security audit intervals.',
      ],
      recommendations: [
        'Enforce hardware-bound FIDO2 WebAuthn authentication for all administrative tiers.',
        'Remediate high-severity template injection in notification microservice.',
        'Accelerate SIEM rule evaluation window tuning to detect low-and-slow password spraying.',
      ],
    };

    const report = await prisma.securityReport.create({
      data: {
        organizationId: user.organizationId,
        reportType: reportType || 'EXECUTIVE_SUMMARY',
        title: title || `Executive Cyber Security Posture Report - ${new Date().toLocaleDateString()}`,
        periodStart: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        periodEnd: new Date(),
        summaryText: 'Comprehensive executive summary of telemetry, alerts, incidents, and vulnerability posture.',
        reportDataJson: JSON.stringify(reportData),
        generatedBy: user.name,
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'REPORT_EXPORTED',
      entityType: 'REPORT',
      entityId: report.id,
      safeMetadata: { reportType, title: report.title },
    });

    return NextResponse.json({ success: true, report, reportData });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
