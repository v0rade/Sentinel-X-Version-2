import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Failed to verify session' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Handle logout action
    if (action === 'logout') {
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

    // Default: handle login
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user || !user.isActive) {
      await bcrypt.compare('dummy', '$2a$10$abcdefghijklmnopqrstuvwxyz123456');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: { increment: 1 } },
      });

      if (user.memberships[0]) {
        await logAuditEvent({
          organizationId: user.memberships[0].organizationId,
          actorId: user.id,
          action: 'USER_LOGIN_FAILED',
          entityType: 'USER',
          entityId: user.id,
          result: 'FAILURE',
          sourceIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
          safeMetadata: { email, attempts: updatedUser.failedLogins },
        });
      }

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const primaryMembership = user.memberships[0];
    if (!primaryMembership) {
      return NextResponse.json({ error: 'User does not belong to any organization' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lastLoginAt: new Date() },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      organizationId: primaryMembership.organizationId,
      role: primaryMembership.role as any,
    });

    await logAuditEvent({
      organizationId: primaryMembership.organizationId,
      actorId: user.id,
      action: 'USER_LOGIN_SUCCESS',
      entityType: 'USER',
      entityId: user.id,
      result: 'SUCCESS',
      sourceIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
      safeMetadata: { email, role: primaryMembership.role },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        title: user.title,
        role: primaryMembership.role,
        organizationId: primaryMembership.organizationId,
        organizationName: primaryMembership.organization.name,
      },
      token,
    });

    response.cookies.set('sentinel_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600,
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
