'use client';

import React, { useEffect, useState } from 'react';
import {
  Server,
  Database,
  Globe,
  HardDrive,
  Cpu,
  Layers,
  Shield,
  Activity,
} from 'lucide-react';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAssets() {
    try {
      const res = await fetch('/api/v1/assets');
      if (res.ok) {
        const json = await res.json();
        setAssets(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAssets();
  }, []);

  function getAssetIcon(type: string) {
    switch (type) {
      case 'DATABASE':
        return Database;
      case 'WEB_APPLICATION':
        return Globe;
      case 'API_SERVICE':
        return Server;
      default:
        return HardDrive;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" />
          Enterprise Asset Inventory
        </h1>
        <p className="text-xs text-slate-400">
          Managed assets with environment tagging, security classification, owner accountability, and linked vulnerabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500 font-mono text-xs">
            LOADING ASSETS INVENTORY...
          </div>
        ) : (
          assets.map((asset) => {
            const Icon = getAssetIcon(asset.assetType);
            return (
              <div
                key={asset.id}
                className="bg-[#0d131f] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                        asset.criticality === 'CRITICAL'
                          ? 'badge-critical'
                          : asset.criticality === 'HIGH'
                          ? 'badge-high'
                          : 'badge-low'
                      }`}
                    >
                      {asset.criticality}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-slate-200 mb-1">{asset.name}</h2>
                  <p className="text-xs text-slate-400 mb-3">{asset.description}</p>

                  <div className="space-y-1.5 text-[11px] font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 mb-3">
                    <div>
                      <span className="text-slate-500">Hostname:</span>{' '}
                      <span className="text-slate-300">{asset.hostname || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">IP Address:</span>{' '}
                      <span className="text-slate-300">{asset.ipAddress || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Environment:</span>{' '}
                      <span className="text-cyan-400">{asset.environment}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Owner:</span>{' '}
                      <span className="text-slate-300">{asset.owner}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Class: {asset.securityClass}</span>
                  <span className="text-purple-400 font-bold">
                    {asset.vulnerabilities?.length || 0} Vulns
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
