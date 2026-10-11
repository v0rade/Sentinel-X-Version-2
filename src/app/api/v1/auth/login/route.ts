import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
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
      // Simulate equal response timing against timing attacks
      await bcrypt.compare('dummy', '$2a$10$abcdefghijklmnopqrstuvwxyz123456');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Increment failed logins
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: { increment: 1 } },
      });

      // Record audit log for failed login
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

    // Reset failed logins & update lastLoginAt
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

    // Record audit log for successful login
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

    // Set secure HTTP-only cookie
    response.cookies.set('sentinel_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600, // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
