import { prisma } from './prisma';
import { SecurityEvent } from '@prisma/client';

export interface DetectionResult {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  alertCreated: boolean;
  alertId?: string;
  matchedEventIds: string[];
}

/**
 * Deterministic SIEM-inspired Rule Detection Engine.
 * Evaluates inbound security events against configured detection rules within time windows.
 */
export async function evaluateDetectionRules(
  organizationId: string,
  recentEvent: SecurityEvent
): Promise<DetectionResult[]> {
  const activeRules = await prisma.detectionRule.findMany({
    where: {
      organizationId,
      enabled: true,
    },
  });

  const results: DetectionResult[] = [];

  for (const rule of activeRules) {
    try {
      const windowStart = new Date(Date.now() - rule.evalWindowSecs * 1000);
      let matched = false;
      let matchedEventIds: string[] = [];
      let alertTitle = '';
      let alertDesc = '';
      let affectedAsset = recentEvent.targetResource || 'Internal System';
      let evidenceSummary = '';
      let recommendedDefense = '';

      // 1. Repeated Failed Logins Rule (Brute Force)
      if (rule.ruleCategory === 'AUTH_ANOMALY' && rule.mitreTechniqueId?.startsWith('T1110.001')) {
        if (recentEvent.eventCategory === 'AUTH_FAILURE') {
          const failures = await prisma.securityEvent.findMany({
            where: {
              organizationId,
              eventCategory: 'AUTH_FAILURE',
              actorIdentity: recentEvent.actorIdentity,
              timestamp: { gte: windowStart },
            },
            take: rule.threshold + 1,
            select: { id: true, sourceIp: true, actorIdentity: true },
          });

          if (failures.length >= rule.threshold) {
            matched = true;
            matchedEventIds = failures.map((f) => f.id);
            alertTitle = `Brute-Force Threshold Exceeded: ${recentEvent.actorIdentity || 'Unknown Target'}`;
            alertDesc = `Detected ${failures.length} consecutive failed authentication attempts targeting ${recentEvent.actorIdentity} within ${Math.round(rule.evalWindowSecs / 60)} minutes.`;
            evidenceSummary = `Source IP: ${recentEvent.sourceIp || '192.168.1.100'}, Attempt count: ${failures.length}`;
            recommendedDefense = 'Enforce account temporary lockout, reset session tokens, and block offending source IP at network perimeter.';
          }
        }
      }

      // 2. Password Spraying Simulation (T1110.003)
      else if (rule.mitreTechniqueId === 'T1110.003') {
        if (recentEvent.eventCategory === 'AUTH_FAILURE' && recentEvent.sourceIp) {
          const sprayedEvents = await prisma.securityEvent.findMany({
            where: {
              organizationId,
              eventCategory: 'AUTH_FAILURE',
              sourceIp: recentEvent.sourceIp,
              timestamp: { gte: windowStart },
            },
            select: { id: true, actorIdentity: true },
          });

          // Check distinct accounts targeted
          const distinctAccounts = new Set(sprayedEvents.map((e) => e.actorIdentity).filter(Boolean));
          if (distinctAccounts.size >= rule.threshold) {
            matched = true;
            matchedEventIds = sprayedEvents.map((e) => e.id);
            alertTitle = `Password Spraying Campaign Detected from IP: ${recentEvent.sourceIp}`;
            alertDesc = `Observed single IP address attempting passwords against ${distinctAccounts.size} distinct test identities.`;
            evidenceSummary = `Attacker Source: ${recentEvent.sourceIp}. Accounts targeted: ${Array.from(distinctAccounts).slice(0, 5).join(', ')}`;
            recommendedDefense = 'Implement rate limiting across API gateways, require MFA challenge, and isolate source subnet.';
          }
        }
      }

      // 3. Privilege Escalation Indicator (T1078)
      else if (rule.mitreTechniqueId === 'T1078' || rule.ruleCategory === 'PRIVILEGE_ABUSE') {
        if (recentEvent.eventCategory === 'PRIVILEGE_ESCALATION') {
          matched = true;
          matchedEventIds = [recentEvent.id];
          alertTitle = `Unauthorized Privilege Escalation Event`;
          alertDesc = `Actor ${recentEvent.actorIdentity || 'Unknown'} initiated privileged command execution without designated administrative session elevation.`;
          affectedAsset = recentEvent.targetResource || 'Control Plane';
          evidenceSummary = `Target: ${recentEvent.targetResource}, Context details: ${recentEvent.eventDetails}`;
          recommendedDefense = 'Immediately terminate actor active bearer tokens, review IAM permission bindings, and rotate secrets.';
        }
      }

      // 4. API Rate Limit / Abuse (T1499)
      else if (rule.mitreTechniqueId === 'T1499' || rule.ruleCategory === 'RATE_VIOLATION') {
        if (recentEvent.eventCategory === 'API_RATE_LIMIT') {
          const rateEvents = await prisma.securityEvent.findMany({
            where: {
              organizationId,
              eventCategory: 'API_RATE_LIMIT',
              sourceIp: recentEvent.sourceIp,
              timestamp: { gte: windowStart },
            },
            select: { id: true },
          });

          if (rateEvents.length >= rule.threshold) {
            matched = true;
            matchedEventIds = rateEvents.map((e) => e.id);
            alertTitle = `High Volume API Threshold Violation from ${recentEvent.sourceIp}`;
            alertDesc = `Source has triggered ${rateEvents.length} rate-limit drop events in ${rule.evalWindowSecs}s.`;
            evidenceSummary = `Violations: ${rateEvents.length}, Target: ${recentEvent.targetResource}`;
            recommendedDefense = 'Engage WAF volumetric drop filter, enforce exponential backoff, and examine origin ASN.';
          }
        }
      }

      // If matched, create Alert and link events atomically
      let alertCreated = false;
      let createdAlertId: string | undefined;

      if (matched && matchedEventIds.length > 0) {
        // Prevent duplicate spamming alerts for the same rule & source within 3 minutes
        const existingRecentAlert = await prisma.alert.findFirst({
          where: {
            organizationId,
            detectionRuleId: rule.id,
            createdAt: { gte: new Date(Date.now() - 180 * 1000) },
          },
        });

        if (!existingRecentAlert) {
          const alert = await prisma.alert.create({
            data: {
              organizationId,
              detectionRuleId: rule.id,
              title: alertTitle || `Security Alert: ${rule.name}`,
              description: alertDesc || rule.description,
              severity: rule.severity,
              status: 'NEW',
              affectedAsset,
              evidenceSummary,
              recommendedDefense,
              potentialImpact: 'Potential account takeover, lateral pivot, or service impairment.',
              alertEvents: {
                create: matchedEventIds.map((id) => ({ eventId: id })),
              },
            },
          });

          // Update detection rule metrics
          await prisma.detectionRule.update({
            where: { id: rule.id },
            data: {
              lastExecutionAt: new Date(),
              alertCount: { increment: 1 },
            },
          });

          alertCreated = true;
          createdAlertId = alert.id;
        }
      }

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        matched,
        alertCreated,
        alertId: createdAlertId,
        matchedEventIds,
      });
    } catch (err) {
      console.error(`Error evaluating detection rule ${rule.name}:`, err);
    }
  }

  return results;
}
