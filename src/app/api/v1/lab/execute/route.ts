import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { evaluateDetectionRules } from '@/lib/detection';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'lab:execute');
    const scenarios = await prisma.labScenario.findMany({
      orderBy: { scenarioKey: 'asc' },
    });
    return NextResponse.json({ data: scenarios });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to retrieve scenarios' }, { status: 500 });
  }
}

// POST /api/v1/lab/execute - Safely runs a synthetic attack scenario and evaluates SIEM rules
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'lab:execute');
    const body = await req.json();
    const { scenarioKey, targetOverride } = body;

    const scenario = await prisma.labScenario.findUnique({
      where: { scenarioKey },
    });

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const run = await prisma.labRun.create({
      data: {
        scenarioId: scenario.id,
        organizationId: user.organizationId,
        executedById: user.id,
        status: 'RUNNING',
        resultsLog: JSON.stringify({ message: 'Scenario initialized' }),
      },
    });

    const generatedEvents: any[] = [];
    const executionLogs: string[] = [];

    // SCENARIO A: Brute Force
    if (scenarioKey === 'SCENARIO_BRUTE_FORCE') {
      const target = targetOverride || 'test.analyst@sentinel.internal';
      executionLogs.push(`[SIMULATION] Commencing synthetic Hydra-style brute force against: ${target}`);

      for (let i = 1; i <= 6; i++) {
        const ev = await prisma.securityEvent.create({
          data: {
            organizationId: user.organizationId,
            sourceType: 'LAB_SIMULATION',
            sourceIdentifier: 'synthetic-lab-kali-01',
            eventCategory: i === 6 ? 'ACCOUNT_LOCKOUT' : 'AUTH_FAILURE',
            severity: i >= 5 ? 'HIGH' : 'MEDIUM',
            actorIdentity: target,
            targetResource: '/api/v1/auth/login',
            sourceIp: '198.51.100.42',
            correlationId: `lab-run-${run.id}`,
            eventDetails: JSON.stringify({
              attempt: i,
              tool: 'SyntheticHydraSim/3.1',
              scenario: scenarioKey,
              payloadSim: 'common-passwords-top100.txt',
            }),
          },
        });
        generatedEvents.push(ev);
        // Feed into SIEM detection engine
        await evaluateDetectionRules(user.organizationId, ev);
      }
      executionLogs.push(`[SIMULATION] Emitted 6 synthetic authentication failure telemetry events.`);
    }

    // SCENARIO B: Password Spray
    else if (scenarioKey === 'SCENARIO_PASSWORD_SPRAY') {
      const accounts = ['service.backup@test', 'dev.lead@test', 'qa.tester@test', 'finance.user@test'];
      executionLogs.push(`[SIMULATION] Executing single-attempt password spray across ${accounts.length} test identities.`);

      for (const acct of accounts) {
        const ev = await prisma.securityEvent.create({
          data: {
            organizationId: user.organizationId,
            sourceType: 'LAB_SIMULATION',
            sourceIdentifier: 'synthetic-lab-spray-bot',
            eventCategory: 'AUTH_FAILURE',
            severity: 'HIGH',
            actorIdentity: acct,
            targetResource: '/login',
            sourceIp: '203.0.113.19',
            correlationId: `lab-run-${run.id}`,
            eventDetails: JSON.stringify({ passwordAttempted: 'SeasonYear!2026', sprayIndex: acct }),
          },
        });
        generatedEvents.push(ev);
        await evaluateDetectionRules(user.organizationId, ev);
      }
      executionLogs.push(`[SIMULATION] Emitted 4 multi-account spray failure events.`);
    }

    // SCENARIO C: Privilege Escalation
    else if (scenarioKey === 'SCENARIO_PRIV_ESC') {
      executionLogs.push(`[SIMULATION] Simulating unauthorized role elevation trigger.`);
      const ev = await prisma.securityEvent.create({
        data: {
          organizationId: user.organizationId,
          sourceType: 'LAB_SIMULATION',
          sourceIdentifier: 'synthetic-agent-sandbox',
          eventCategory: 'PRIVILEGE_ESCALATION',
          severity: 'CRITICAL',
          actorIdentity: 'contractor.guest@sentinel.internal',
          targetResource: '/api/v1/admin/security-policies',
          sourceIp: '192.168.100.50',
          correlationId: `lab-run-${run.id}`,
          eventDetails: JSON.stringify({ attemptedRole: 'SUPER_ADMIN', bypassFlag: true }),
        },
      });
      generatedEvents.push(ev);
      await evaluateDetectionRules(user.organizationId, ev);
      executionLogs.push(`[SIMULATION] Privileged execution telemetry emitted.`);
    }

    // SCENARIO D: Challenge / Multi-Stage
    else if (scenarioKey === 'SCENARIO_CHALLENGE') {
      executionLogs.push(`[CHALLENGE] Scenario playground loaded with 8 multi-stage synthetic signals.`);
      const ev = await prisma.securityEvent.create({
        data: {
          organizationId: user.organizationId,
          sourceType: 'LAB_SIMULATION',
          sourceIdentifier: 'challenge-sandbox-01',
          eventCategory: 'AUTH_FAILURE',
          severity: 'MEDIUM',
          actorIdentity: 'dev.compromised@sentinel.internal',
          targetResource: '/api/v1/auth/token',
          sourceIp: '198.51.100.77',
          correlationId: `lab-challenge-${run.id}`,
          eventDetails: JSON.stringify({ challengeType: 'STEP_1_ANOMALY' }),
        },
      });
      generatedEvents.push(ev);
    }

    // Count alerts generated in this window
    const recentAlerts = await prisma.alert.findMany({
      where: {
        organizationId: user.organizationId,
        createdAt: { gte: run.startedAt },
      },
    });

    const updatedRun = await prisma.labRun.update({
      where: { id: run.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        eventsCount: generatedEvents.length,
        alertsFired: recentAlerts.length,
        resultsLog: JSON.stringify({
          logs: executionLogs,
          generatedEventsCount: generatedEvents.length,
          alertsFiredCount: recentAlerts.length,
          alertTitles: recentAlerts.map((a) => a.title),
        }),
      },
    });

    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'LAB_SIMULATION_EXECUTED',
      entityType: 'LAB_RUN',
      entityId: run.id,
      safeMetadata: { scenarioKey, generatedEvents: generatedEvents.length, alertsTriggered: recentAlerts.length },
    });

    return NextResponse.json({
      success: true,
      run: updatedRun,
      scenario,
      eventsGenerated: generatedEvents.length,
      alertsTriggered: recentAlerts.length,
      alerts: recentAlerts,
    });
  } catch (err: any) {
    console.error('Lab execution error:', err);
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to execute lab scenario' }, { status: 500 });
  }
}
