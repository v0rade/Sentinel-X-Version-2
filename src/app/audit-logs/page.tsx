'use client';

import React, { useEffect, useState } from 'react';
import {
  ScrollText,
  Shield,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    try {
      const res = await fetch('/api/v1/audit-logs');
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-emerald-400" />
            Immutable Security Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Append-only compliance audit ledger. Every authentication event, role elevation, alert triage, risk acceptance, and lab run is permanently recorded.
          </p>
        </div>
        <div className="text-[11px] font-mono px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400">
          Append-Only Ledger Active
        </div>
      </div>

      <div className="bg-[#0d131f] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0a0f19] border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Source IP</th>
                <th className="py-3 px-4">Sanitized Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading audit trail entries...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {log.actor?.name || 'System Engine'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-cyan-400 font-bold">{log.action}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.entityType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          log.result === 'SUCCESS'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : 'text-red-400 bg-red-950/60'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.sourceIp || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-slate-400 text-[10px] truncate max-w-[240px]">
                      {log.safeMetadata}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
