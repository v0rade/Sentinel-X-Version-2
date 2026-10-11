import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { evaluateDetectionRules } from '@/lib/detection';
import { z } from 'zod';

const IngestEventSchema = z.object({
  sourceType: z.string().min(2),
  sourceIdentifier: z.string().min(2),
  eventCategory: z.string().min(2),
  severity: z.enum(['INFORMATIONAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('INFORMATIONAL'),
  actorIdentity: z.string().optional(),
  targetResource: z.string().optional(),
  sourceIp: z.string().optional(),
  correlationId: z.string().optional(),
  eventDetails: z.union([z.record(z.string(), z.any()), z.string()]).transform((val) => 
    typeof val === 'string' ? val : JSON.stringify(val)
  ),
});

// GET /api/v1/security-events - Filtered, paginated event query
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'events:read');
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));
    const skip = (page - 1) * limit;

    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');

    const where: any = {
      organizationId: user.organizationId,
    };

    if (category) where.eventCategory = category;
    if (severity) where.severity = severity;
    if (search) {
      where.OR = [
        { actorIdentity: { contains: search } },
        { targetResource: { contains: search } },
        { sourceIp: { contains: search } },
        { sourceIdentifier: { contains: search } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return NextResponse.json({
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to retrieve events' }, { status: 500 });
  }
}

// POST /api/v1/security-events - Ingest event and trigger SIEM detection engine
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req, 'events:ingest');
    const rawBody = await req.json();

    const parseResult = IngestEventSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid event schema', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Create normalized security event
    const event = await prisma.securityEvent.create({
      data: {
        organizationId: user.organizationId,
        sourceType: data.sourceType,
        sourceIdentifier: data.sourceIdentifier,
        eventCategory: data.eventCategory,
        severity: data.severity,
        actorIdentity: data.actorIdentity || null,
        targetResource: data.targetResource || null,
        sourceIp: data.sourceIp || null,
        correlationId: data.correlationId || `corr-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        eventDetails: data.eventDetails,
        processingStatus: 'PROCESSED',
      },
    });

    // Evaluate detection rules immediately (SIEM detection loop)
    const detectionResults = await evaluateDetectionRules(user.organizationId, event);

    return NextResponse.json({
      success: true,
      event,
      detectionEvaluated: detectionResults.length,
      alertsTriggered: detectionResults.filter((r) => r.alertCreated).length,
      detectionResults,
    }, { status: 201 });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to ingest event' }, { status: 500 });
  }
}
