export type Role =
  | 'SUPER_ADMIN'
  | 'SECURITY_ADMIN'
  | 'SOC_ANALYST'
  | 'SECURITY_ENGINEER'
  | 'DEVELOPER'
  | 'AUDITOR'
  | 'LAB_USER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  title?: string | null;
  organizationId: string;
  organizationName: string;
  role: Role;
}

export type Permission =
  | 'events:read'
  | 'events:ingest'
  | 'alerts:read'
  | 'alerts:manage'
  | 'incidents:read'
  | 'incidents:manage'
  | 'vulnerabilities:read'
  | 'vulnerabilities:manage'
  | 'assets:read'
  | 'assets:manage'
  | 'threat_intel:read'
  | 'threat_intel:manage'
  | 'lab:execute'
  | 'audit:read'
  | 'admin:manage_users'
  | 'admin:manage_org'
  | 'reports:export';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    'events:read', 'events:ingest', 'alerts:read', 'alerts:manage',
    'incidents:read', 'incidents:manage', 'vulnerabilities:read', 'vulnerabilities:manage',
    'assets:read', 'assets:manage', 'threat_intel:read', 'threat_intel:manage',
    'lab:execute', 'audit:read', 'admin:manage_users', 'admin:manage_org', 'reports:export',
  ],
  SECURITY_ADMIN: [
    'events:read', 'events:ingest', 'alerts:read', 'alerts:manage',
    'incidents:read', 'incidents:manage', 'vulnerabilities:read', 'vulnerabilities:manage',
    'assets:read', 'assets:manage', 'threat_intel:read', 'threat_intel:manage',
    'lab:execute', 'audit:read', 'admin:manage_users', 'reports:export',
  ],
  SOC_ANALYST: [
    'events:read', 'events:ingest', 'alerts:read', 'alerts:manage',
    'incidents:read', 'incidents:manage', 'vulnerabilities:read',
    'assets:read', 'threat_intel:read', 'lab:execute', 'audit:read', 'reports:export',
  ],
  SECURITY_ENGINEER: [
    'events:read', 'alerts:read', 'incidents:read',
    'vulnerabilities:read', 'vulnerabilities:manage', 'assets:read', 'assets:manage',
    'threat_intel:read', 'threat_intel:manage', 'lab:execute', 'reports:export',
  ],
  DEVELOPER: [
    'vulnerabilities:read', 'vulnerabilities:manage', 'assets:read', 'reports:export',
  ],
  AUDITOR: [
    'events:read', 'alerts:read', 'incidents:read', 'vulnerabilities:read',
    'assets:read', 'audit:read', 'reports:export',
  ],
  LAB_USER: [
    'events:read', 'alerts:read', 'lab:execute',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.includes(permission) : false;
}
