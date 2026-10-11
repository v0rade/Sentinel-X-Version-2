'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import {
  ShieldAlert,
  Activity,
  Flame,
  AlertTriangle,
  FolderGit2,
  Bug,
  Server,
  Radar,
  FlaskConical,
  ScrollText,
  FileText,
  LogOut,
  UserCheck,
} from 'lucide-react';

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, switchDemoRole, logout } = useAuth();

  const navItems = [
    { label: 'SOC Dashboard', href: '/', icon: Activity },
    { label: 'Security Events', href: '/events', icon: Flame },
    { label: 'Detection Rules', href: '/detection-rules', icon: ShieldAlert },
    { label: 'Alert Center', href: '/alerts', icon: AlertTriangle },
    { label: 'Incident Response', href: '/incidents', icon: FolderGit2 },
    { label: 'Vulnerabilities', href: '/vulnerabilities', icon: Bug },
    { label: 'Asset Inventory', href: '/assets', icon: Server },
    { label: 'Threat Intel', href: '/threat-intel', icon: Radar },
    { label: 'Attack Simulation Lab', href: '/lab', icon: FlaskConical, highlight: true },
    { label: 'Audit Trail', href: '/audit-logs', icon: ScrollText },
    { label: 'Security Reports', href: '/reports', icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0d131f] flex flex-col fixed inset-y-0 z-30">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-sm flex items-center gap-1.5">
              <span>SENTINEL</span>
              <span className="text-cyan-400">X</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-300 font-mono">v2.4</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {user?.organizationName || 'Acme Global Defense'}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${item.highlight && !isActive ? 'border border-purple-500/30 text-purple-300 bg-purple-950/20' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200 font-mono">
                    Lab
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Role Switcher for Portfolio Demonstration */}
        <div className="p-3 border-t border-slate-800 bg-[#0a0f19]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-cyan-400" /> Demo RBAC Role
            </span>
          </div>
          <select
            value={user?.role || 'SOC_ANALYST'}
            onChange={(e) => switchDemoRole(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="SUPER_ADMIN">SUPER_ADMIN (Marcus Vance)</option>
            <option value="SECURITY_ADMIN">SECURITY_ADMIN (Diana Prince)</option>
            <option value="SOC_ANALYST">SOC_ANALYST (Sarah Chen)</option>
            <option value="SECURITY_ENGINEER">SECURITY_ENGINEER (Alex Rivera)</option>
            <option value="DEVELOPER">DEVELOPER (David Kim)</option>
            <option value="AUDITOR">AUDITOR (Elena Rostova)</option>
            <option value="LAB_USER">LAB_USER (Trainee Jordan)</option>
          </select>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="truncate max-w-[130px]">{user?.name}</span>
            <button
              onClick={() => logout()}
              title="Logout"
              className="text-slate-400 hover:text-red-400 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col">
        {/* Top SOC Status Header */}
        <header className="h-14 border-b border-slate-800 bg-[#0d131f]/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 -ml-4.5"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">SOC Operational</span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="text-xs text-slate-400">
              Active Tenant: <span className="text-slate-200 font-medium">{user?.organizationName || 'Acme Global Defense'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800 text-slate-300">
              Actor: <span className="text-cyan-400">{user?.email || 'analyst@sentinel.internal'}</span>
            </div>
            <div className="bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 px-2.5 py-1 rounded">
              ROLE: {user?.role || 'SOC_ANALYST'}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 bg-[#080c14]">{children}</main>
      </div>
    </div>
  );
}
