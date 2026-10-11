import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { AuthUser, Role, Permission, hasPermission } from './rbac';

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel-x-ultra-secure-key-2026-production';
const SESSION_COOKIE_NAME = 'sentinel_session';

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<AuthUser | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Cookies not accessible in some standalone scripts or tests
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      memberships: {
        where: { organizationId: payload.organizationId },
        include: { organization: true },
      },
    },
  });

  if (!user || !user.isActive) return null;

  const membership = user.memberships[0];
  if (!membership) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    title: user.title,
    organizationId: membership.organizationId,
    organizationName: membership.organization.name,
    role: membership.role as Role,
  };
}

export async function requireAuth(req?: NextRequest, requiredPermission?: Permission): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}
