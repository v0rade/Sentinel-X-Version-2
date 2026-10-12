'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    title?: string | null;
    role: string;
    organizationId: string;
    organizationName: string;
  } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
  switchDemoRole: async () => {},
});

const ROLE_EMAILS: Record<string, string> = {
  SUPER_ADMIN: 'admin@sentinel.internal',
  SECURITY_ADMIN: 'sec-admin@sentinel.internal',
  SOC_ANALYST: 'analyst@sentinel.internal',
  SECURITY_ENGINEER: 'engineer@sentinel.internal',
  DEVELOPER: 'dev@sentinel.internal',
  AUDITOR: 'auditor@sentinel.internal',
  LAB_USER: 'lab@sentinel.internal',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const res = await fetch('/api/v1/auth');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Auto-login as default SOC Analyst for immediate portfolio review
        await login('analyst@sentinel.internal', 'SentinelX#2026Secure!');
      }
    } catch (e) {
      console.error('Check auth error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  }

  async function logout() {
    await fetch('/api/v1/auth?action=logout', { method: 'POST' });
    setUser(null);
  }

  async function switchDemoRole(role: string) {
    const email = ROLE_EMAILS[role];
    if (email) {
      await login(email, 'SentinelX#2026Secure!');
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
