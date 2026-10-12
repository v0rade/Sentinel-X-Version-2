'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Power,
  Sliders,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export default function DetectionRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchRules() {
    try {
      const res = await fetch('/api/v1/alerts?type=rules');
      if (res.ok) {
        const json = await res.json();
        setRules(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRules();
  }, []);

  async function toggleRule(ruleId: string, currentEnabled: boolean) {
    setUpdatingId(ruleId);
    try {
      const res = await fetch('/api/v1/alerts?type=rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, enabled: !currentEnabled }),
      });
      if (res.ok) await fetchRules();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          SIEM Detection Engine &amp; Rule Management
        </h1>
        <p className="text-xs text-slate-400">
          Deterministic correlation rules mapped to MITRE ATT&amp;CK framework. Configurable thresholds and evaluation windows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-500 font-mono text-xs">
            LOADING DETECTION RULES...
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-[#0d131f] border rounded-xl p-5 flex flex-col justify-between transition ${
                rule.enabled ? 'border-slate-800' : 'border-slate-800/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      rule.severity === 'CRITICAL'
                        ? 'badge-critical'
                        : rule.severity === 'HIGH'
                        ? 'badge-high'
                        : 'badge-medium'
                    }`}
                  >
                    {rule.severity}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {rule.ruleCategory}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-slate-100 mb-1">{rule.name}</h2>
                <p className="text-xs text-slate-400 mb-3">{rule.description}</p>

                <div className="space-y-1.5 text-[11px] font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 mb-4">
                  <div className="text-slate-400">
                    <span className="text-slate-500">MITRE ATT&CK:</span>{' '}
                    <span className="text-purple-300 font-semibold">{rule.mitreTechniqueId}</span> -{' '}
                    <span className="text-slate-400">{rule.mitreTactic}</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-500">Threshold:</span>{' '}
                    <span className="text-slate-200">{rule.threshold} occurrences</span> within{' '}
                    <span className="text-slate-200">{rule.evalWindowSecs} seconds</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-500">Alerts Generated:</span>{' '}
                    <span className="text-amber-400 font-bold">{rule.alertCount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-500">
                  Status: {rule.enabled ? <span className="text-emerald-400 font-bold">ACTIVE</span> : <span className="text-red-400 font-bold">DISABLED</span>}
                </span>

                <button
                  onClick={() => toggleRule(rule.id, rule.enabled)}
                  disabled={updatingId === rule.id}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    rule.enabled
                      ? 'bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/40'
                      : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/40'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
