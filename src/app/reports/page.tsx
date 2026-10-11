'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<any | null>(null);

  async function generateReport(reportType: string, title: string) {
    setGenerating(true);
    setReportResult(null);
    try {
      const res = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, title }),
      });
      if (res.ok) {
        const json = await res.json();
        setReportResult(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Security Report Generator
        </h1>
        <p className="text-xs text-slate-400">
          Generate evidence-based executive security reports, posture assessments, and audit compliance packages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                EXECUTIVE
              </span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-200 mb-1">Executive Cyber Posture Summary</h2>
            <p className="text-xs text-slate-400 mb-4">
              High-level metrics covering MTTA, MTTR, critical alerts resolved, risk acceptance status, and strategic next steps.
            </p>
          </div>
          <button
            onClick={() =>
              generateReport('EXECUTIVE_SUMMARY', 'Executive Cyber Security Posture Report')
            }
            disabled={generating}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold font-mono transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Generate Executive Report
          </button>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-purple-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                TECHNICAL AUDIT
              </span>
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-200 mb-1">Vulnerability Remediation Ledger</h2>
            <p className="text-xs text-slate-400 mb-4">
              Detailed findings ledger with CVEs, CVSS scores, remediation SLAs, verification status, and audit trails.
            </p>
          </div>
          <button
            onClick={() =>
              generateReport('VULNERABILITY_ASSESSMENT', 'Technical Vulnerability Remediation Ledger')
            }
            disabled={generating}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold font-mono transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Generate Vulnerability Ledger
          </button>
        </div>
      </div>

      {reportResult && (
        <div className="bg-[#0b101b] border border-cyan-500/40 rounded-xl p-6 glow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400">REPORT COMPILED</span>
              <h3 className="text-sm font-bold text-slate-100">{reportResult.report?.title}</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Evidence Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Telemetry Events</div>
              <div className="text-base font-bold text-cyan-400">
                {reportResult.reportData?.metrics?.totalTelemetryEvents}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Alerts Recorded</div>
              <div className="text-base font-bold text-slate-200">
                {reportResult.reportData?.metrics?.alertsCreated}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Critical Vulns</div>
              <div className="text-base font-bold text-purple-400">
                {reportResult.reportData?.metrics?.criticalVulns}
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Incidents Open</div>
              <div className="text-base font-bold text-amber-400">
                {reportResult.reportData?.metrics?.incidentsCount}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-300">Executive Findings:</div>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              {reportResult.reportData?.keyFindings?.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-300">Recommended Remediation Steps:</div>
            <ul className="list-disc list-inside text-cyan-300 space-y-1">
              {reportResult.reportData?.recommendations?.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
