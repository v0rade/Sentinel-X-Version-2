import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (user) {
    await logAuditEvent({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'USER_LOGOUT',
      entityType: 'USER',
      entityId: user.id,
      safeMetadata: { email: user.email },
    });
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('sentinel_session');
  return response;
}
