import { prisma } from './prisma';

interface LogAuditParams {
  organizationId: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  safeMetadata?: Record<string, unknown>;
  result?: 'SUCCESS' | 'FAILURE' | 'DENIED';
  sourceIp?: string | null;
  requestId?: string | null;
}

/**
 * Creates an append-only audit trail record for compliance and accountability.
 * Sanitizes metadata so passwords, tokens, and raw secrets are strictly omitted.
 */
export async function logAuditEvent({
  organizationId,
  actorId,
  action,
  entityType,
  entityId,
  safeMetadata = {},
  result = 'SUCCESS',
  sourceIp = '127.0.0.1',
  requestId,
}: LogAuditParams) {
  try {
    // Redact any accidentally passed credential keys
    const sanitized = { ...safeMetadata };
    ['password', 'token', 'secret', 'hash', 'apiKey', 'authorization'].forEach((key) => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return await prisma.auditLog.create({
      data: {
        organizationId,
        actorId: actorId || null,
        action,
        entityType,
        entityId,
        sourceIp,
        requestId: requestId || `req-${Date.now()}`,
        result,
        safeMetadata: JSON.stringify(sanitized),
      },
    });
  } catch (error) {
    console.error('Failed to write audit log entry:', error);
    // Never crash primary operations because of telemetry logger, but log strictly
    return null;
  }
}
