'use client';

import React, { useEffect, useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle,
  AlertOctagon,
  Terminal,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function LabPage() {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any | null>(null);

  async function fetchScenarios() {
    try {
      const res = await fetch('/api/v1/lab/execute');
      if (res.ok) {
        const json = await res.json();
        setScenarios(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScenarios();
  }, []);

  async function runScenario(scenarioKey: string) {
    setRunningKey(scenarioKey);
    setLastResult(null);
    try {
      const res = await fetch('/api/v1/lab/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioKey }),
      });
      const data = await res.json();
      setLastResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRunningKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Lab Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-950/40 via-[#0d131f] to-[#0d131f] border border-purple-500/30 rounded-xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <h1 className="text-lg font-bold text-slate-100 tracking-wide">
                Cybersecurity Attack Simulation Lab
              </h1>
              <span className="text-[10px] font-mono uppercase bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                Synthetic Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Safe training fixtures generating synthetic attack telemetry. Observe in real-time how the SIEM detection engine correlates events and generates actionable alerts according to MITRE ATT&amp;CK techniques.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/60 px-3 py-2 rounded-lg border border-purple-800/40">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Strict Zero-Harm Isolation Enforced</span>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scen) => {
          const isRunning = runningKey === scen.scenarioKey;
          return (
            <div
              key={scen.id}
              className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    {scen.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {scen.difficulty}
                  </span>
                </div>
                <h2 className="text-sm font-bold text-slate-200 mb-1">{scen.title}</h2>
                <p className="text-xs text-slate-400 mb-3">{scen.description}</p>

                <div className="space-y-1.5 text-[11px] font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 mb-4">
                  <div className="text-slate-400">
                    <span className="text-slate-500">MITRE ATT&CK:</span>{' '}
                    <span className="text-purple-300">{scen.mitreTechnique}</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-500">Synthetic Target:</span>{' '}
                    <span className="text-slate-300">{scen.syntheticTarget}</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-500">Expected Alert:</span>{' '}
                    <span className="text-emerald-400">{scen.expectedOutcome}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono">Repeatable &amp; Resettable</span>
                <button
                  onClick={() => runScenario(scen.scenarioKey)}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Execute Simulation
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Simulation Execution Results Box */}
      {lastResult && (
        <div className="bg-[#0b101b] border border-cyan-500/40 rounded-xl p-5 glow-card space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200 uppercase tracking-wide">
                Simulation Execution Completed
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">Events Emitted: <span className="text-cyan-400 font-bold">{lastResult.eventsGenerated}</span></span>
              <span className="text-slate-400">Alerts Triggered: <span className="text-red-400 font-bold">{lastResult.alertsTriggered}</span></span>
            </div>
          </div>

          {/* Alert Output list */}
          {lastResult.alerts && lastResult.alerts.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">
                SIEM Rule Match &amp; Alert Generation:
              </div>
              {lastResult.alerts.map((al: any) => (
                <div key={al.id} className="p-3 bg-red-950/20 border border-red-500/40 rounded-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400">{al.title}</span>
                    <span className="badge-critical text-[10px] px-2 py-0.5 rounded font-bold">{al.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{al.description}</p>
                  <div className="text-[10px] text-slate-400">
                    Defensive Advice: <span className="text-slate-200">{al.recommendedDefense}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-400 text-[11px] space-y-1">
            <div className="text-slate-300 font-bold flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Telemetry Correlation Summary:
            </div>
            <div>Run ID: <span className="text-cyan-400">{lastResult.run?.id}</span></div>
            <div>State: <span className="text-emerald-400">PROCESSED &amp; INDEXED</span></div>
            <div className="text-slate-400">The generated events are now available in the Security Events stream and Alert Center for full analyst triage.</div>
          </div>
        </div>
      )}
    </div>
  );
}
