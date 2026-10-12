'use client';

import React, { useEffect, useState } from 'react';
import {
  Radar,
  ShieldAlert,
  Globe,
  FileCode,
  Hash,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function ThreatIntelPage() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchIntel() {
    try {
      const res = await fetch('/api/v1/assets?type=threat-intel');
      if (res.ok) {
        const json = await res.json();
        setIndicators(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIntel();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan-400" />
            Threat Intelligence &amp; Indicator Repository
          </h1>
          <p className="text-xs text-slate-400">
            Indicators of Compromise (IoCs) with synthetic sandbox tagging, confidence ratings, and analyst investigation context.
          </p>
        </div>
        <div className="text-[11px] font-mono px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
          Classification: <span className="text-cyan-400">RFC Safe &amp; Synthetic Tagged</span>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            LOADING THREAT INDICATORS...
          </div>
        ) : (
          indicators.map((ind) => (
            <div
              key={ind.id}
              className="bg-[#0d131f] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-bold">
                    {ind.indicatorType}
                  </span>
                  <span className="font-mono text-xs text-slate-100 font-bold">{ind.value}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                    {ind.classification}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{ind.description}</p>
                {ind.analystNotes && (
                  <div className="text-[11px] font-mono text-slate-500">
                    Notes: <span className="text-slate-400">{ind.analystNotes}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Threat Category</div>
                  <div className="text-red-400 font-bold">{ind.threatCategory}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                  <div className="text-cyan-400 font-bold">{ind.confidence}%</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
