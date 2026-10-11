'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  FolderGit2,
  Bug,
  Server,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/v1/dashboard/metrics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 font-mono text-xs">
        <Zap className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
        LOADING SENTINEL TELEMETRY METRICS...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentEvents = data?.recentEvents || [];
  const recentAlerts = data?.recentAlerts || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Posture Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Posture Score Card */}
        <div className="lg:col-span-1 bg-[#0d131f] border border-slate-800 rounded-xl p-5 glow-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono text-slate-400">Security Posture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-slate-100">{metrics.postureScore}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Calculated: <code className="text-cyan-400">100 - (15×CritAlerts + 10×CritVulns + 8×Incidents)</code>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.postureScore >= 80 ? 'bg-emerald-500' : metrics.postureScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.postureScore}%` }}
            />
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Critical Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-red-400">{metrics.criticalAlerts}</span>
            <span className="text-xs text-slate-400 ml-2">/ {metrics.openAlerts} total open</span>
          </div>
          <Link href="/alerts" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono">
            Investigate alerts <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Open Incidents</span>
            <FolderGit2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-amber-400">{metrics.openIncidents}</span>
            <span className="text-xs text-slate-400 ml-2">in active response</span>
          </div>
          <Link href="/incidents" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono">
            Manage incident board <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-mono">
            <span>Critical Vulns</span>
            <Bug className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-purple-400">{metrics.criticalVulns}</span>
            <span className="text-xs text-slate-400 ml-2">pending patch</span>
          </div>
          <Link href="/vulnerabilities" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono">
            Review vulnerabilities <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* SLA and Event Velocity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-lg p-3.5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">MTTA (Mean Time to Acknowledge)</div>
            <div className="text-sm font-bold text-slate-200">{metrics.meanTimeToAcknowledgeMins} minutes</div>
          </div>
        </div>
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-lg p-3.5 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">MTTR (Mean Time to Resolve)</div>
            <div className="text-sm font-bold text-slate-200">{metrics.meanTimeToResolveMins} minutes</div>
          </div>
        </div>
        <div className="bg-[#0b101b] border border-slate-800/80 rounded-lg p-3.5 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Active SIEM Detection Rules</div>
            <div className="text-sm font-bold text-slate-200">{metrics.activeRules} Rules Enabled</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent SIEM Alerts & Security Events Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alerts Table */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-wide">High-Priority Security Alerts</h2>
            </div>
            <Link href="/alerts" className="text-xs text-cyan-400 hover:underline">
              View All ({metrics.openAlerts})
            </Link>
          </div>

          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono py-8 text-center">No open alerts recorded.</div>
            ) : (
              recentAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col gap-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          alert.severity === 'CRITICAL'
                            ? 'badge-critical'
                            : alert.severity === 'HIGH'
                            ? 'badge-high'
                            : 'badge-medium'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{alert.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>Target: {alert.affectedAsset || 'General System'}</span>
                    <span className="text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded">STATUS: {alert.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Telemetry Stream */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-bold tracking-wide">Normalized Telemetry Events</h2>
            </div>
            <Link href="/events" className="text-xs text-cyan-400 hover:underline">
              Full Stream ({metrics.totalEvents})
            </Link>
          </div>

          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <div className="text-xs text-slate-500 font-mono py-8 text-center">No telemetry received.</div>
            ) : (
              recentEvents.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-2.5 bg-slate-900/50 border border-slate-800/80 rounded-md font-mono text-[11px] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        ev.eventCategory.includes('FAILURE') || ev.eventCategory.includes('LOCKOUT')
                          ? 'text-red-400 bg-red-950/50'
                          : ev.eventCategory.includes('ESCALATION')
                          ? 'text-purple-400 bg-purple-950/50'
                          : 'text-emerald-400 bg-emerald-950/50'
                      }`}
                    >
                      {ev.eventCategory}
                    </span>
                    <span className="text-slate-300 truncate">{ev.actorIdentity || 'anonymous'}</span>
                    <span className="text-slate-500 truncate">{ev.targetResource}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {ev.sourceIp || '10.0.1.x'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
