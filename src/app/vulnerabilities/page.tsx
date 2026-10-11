'use client';

import React, { useEffect, useState } from 'react';
import {
  Bug,
  AlertOctagon,
  ShieldAlert,
  ExternalLink,
  CheckCircle,
  FileText,
  Filter,
} from 'lucide-react';

export default function VulnerabilitiesPage() {
  const [vulns, setVulns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [riskModalVuln, setRiskModalVuln] = useState<any | null>(null);
  const [justification, setJustification] = useState('');
  const [submittingRisk, setSubmittingRisk] = useState(false);

  async function fetchVulns() {
    try {
      const res = await fetch('/api/v1/vulnerabilities');
      if (res.ok) {
        const json = await res.json();
        setVulns(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVulns();
  }, []);

  async function acceptRisk() {
    if (!riskModalVuln || justification.trim().length < 10) return;
    setSubmittingRisk(true);
    try {
      const res = await fetch('/api/v1/vulnerabilities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: riskModalVuln.id,
          status: 'ACCEPTED_RISK',
          riskAcceptedReason: justification.trim(),
        }),
      });
      if (res.ok) {
        setRiskModalVuln(null);
        setJustification('');
        await fetchVulns();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRisk(false);
    }
  }

  async function markFixed(id: string) {
    try {
      const res = await fetch('/api/v1/vulnerabilities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'FIXED' }),
      });
      if (res.ok) await fetchVulns();
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = vulns.filter((v) => {
    if (filterSeverity === 'ALL') return true;
    return v.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Bug className="w-5 h-5 text-purple-400" />
            Vulnerability Management &amp; Remediation
          </h1>
          <p className="text-xs text-slate-400">
            Track SAST, SCA, and infrastructure security findings with CVSS scoring, due dates, and mandatory risk acceptance justification.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {['ALL', 'CRITICAL', 'HIGH', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                filterSeverity === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            LOADING VULNERABILITY FINDINGS...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No vulnerabilities found matching filters.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      item.severity === 'CRITICAL'
                        ? 'badge-critical'
                        : item.severity === 'HIGH'
                        ? 'badge-high'
                        : 'badge-low'
                    }`}
                  >
                    {item.severity} {item.cvssScore && `(CVSS ${item.cvssScore})`}
                  </span>
                  <span className="font-mono text-xs text-cyan-400 font-bold">{item.findingReference}</span>
                  <span className="font-bold text-slate-200 text-sm">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    Source: {item.detectionSource}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      item.status === 'FIXED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : item.status === 'ACCEPTED_RISK'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300">{item.description}</p>

              {/* Context Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                <div>
                  <span className="text-slate-500">Affected Asset:</span>{' '}
                  <span className="text-slate-200">{item.asset?.name || 'Customer Portal'}</span>
                </div>
                <div>
                  <span className="text-slate-500">CVE ID:</span>{' '}
                  <span className="text-purple-300">{item.cveId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Assigned Engineer:</span>{' '}
                  <span className="text-slate-200">{item.assignedEngineer?.name || 'Alex Rivera'}</span>
                </div>
                {item.remediationAdvice && (
                  <div className="md:col-span-3 text-emerald-300">
                    <span className="text-emerald-500">Remediation Guidance:</span>{' '}
                    {item.remediationAdvice}
                  </div>
                )}
                {item.riskAcceptedReason && (
                  <div className="md:col-span-3 text-blue-300 bg-blue-950/30 p-2 rounded border border-blue-900/40">
                    <span className="text-blue-400 font-bold">Formal Risk Acceptance Justification:</span>{' '}
                    {item.riskAcceptedReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {item.status !== 'FIXED' && (
                  <button
                    onClick={() => markFixed(item.id)}
                    className="px-3 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-mono rounded border border-emerald-800/40 transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" /> Verify &amp; Close Fixed
                  </button>
                )}
                {item.status !== 'ACCEPTED_RISK' && (
                  <button
                    onClick={() => setRiskModalVuln(item)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded border border-slate-700 transition"
                  >
                    Accept Business Risk...
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mandatory Justification Modal for Risk Acceptance */}
      {riskModalVuln && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Formal Security Risk Acceptance Form
            </h2>
            <p className="text-xs text-slate-400">
              Accepting risk for <strong className="text-cyan-400">{riskModalVuln.findingReference}</strong> ({riskModalVuln.title}) requires an auditable justification citing compensating controls or isolated network environment.
            </p>

            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="State the business rationale and technical compensating controls (e.g. Host is isolated in dedicated private subnet behind zero-trust gateway)..."
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRiskModalVuln(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={acceptRisk}
                disabled={submittingRisk || justification.trim().length < 10}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold font-mono disabled:opacity-50 transition"
              >
                Submit Risk Acceptance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
